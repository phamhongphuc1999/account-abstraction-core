import { toRpcSig } from '@ethereumjs/util';
import {
  Account,
  AccountAbi,
  AccountFactoryAbi,
  AccountState,
  AccountType,
  PrivateKey,
  PublicKey,
  Signature,
  SignatureScheme,
  UserOperationStruct,
  WalletInfo,
  WalletStrategy,
} from '@peter-present/user-operation-type';
import {
  AbiCoder,
  BytesLike,
  Contract,
  concat,
  ethers,
  getBytes,
  keccak256,
  toUtf8Bytes,
} from 'ethers';
import { DEPLOY_SALTS_MVP, NetworkObject } from './constants.js';
import { AccountPackageErrors } from './errors.js';
import { HDKeyring, Signatures } from './keyring/index.js';
import { getEVMAddressFromPublicKey } from './utils.js';

export * from './constants.js';
export * from './errors.js';
export * from './keyring/index.js';
export * from './utils.js';

interface InitialParams {
  rpcUrl: string;
  networkConfig: NetworkObject;
}

export class AccountPackage {
  info!: WalletInfo;
  accounts!: Account[];
  #keyring!: HDKeyring;
  #password!: string;
  config: NetworkObject;
  factoryContract!: Contract;
  entryPointContract!: Contract;
  provider: ethers.JsonRpcProvider;

  constructor(params: InitialParams) {
    const { rpcUrl, networkConfig } = params;
    this.config = networkConfig;

    this.accounts = [];

    this.#keyring = new HDKeyring();
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.factoryContract = new Contract(
      this.config.addresses.accountFactory,
      JSON.stringify(AccountFactoryAbi),
      this.provider,
    );
  }

  public async createKeyring(password: string, info: WalletInfo): Promise<WalletInfo> {
    if (!password || !password.length) throw new Error(AccountPackageErrors.MissingPassword);
    this.#password = password;
    this.#keyring.generateRandomMnemonic();
    const state: AccountState = {
      keyringState: { mnemonic: this.#keyring.mnemonic, numberOfKeys: 0 },
    };
    const walletInfo = { ...info, ...{ state: state } };
    this.info = walletInfo;
    return this.info;
  }

  public async restoreKeyring(password: string, info: WalletInfo) {
    if (!password || !password.length) throw new Error(AccountPackageErrors.MissingPassword);
    if (!info.state) throw new Error(AccountPackageErrors.MissingAccountState);
    switch (info.strategy) {
      case WalletStrategy.SIMPLE: {
        this.#keyring.deserialize(info.state?.keyringState);
        if (info.state.accounts) this.accounts = info.state.accounts;
        break;
      }
      case WalletStrategy.WEB2: {
        break;
      }
      case WalletStrategy.WEB3: {
        break;
      }
    }
    this.info = info;
  }

  public async addAccount(type: AccountType): Promise<Account> {
    const account: Account = { address: '', type: type };

    switch (type) {
      case AccountType.EVM: {
        const privateKey: PrivateKey = (await this.#keyring.addKeys(1))[0];
        const publicKey: PublicKey = {
          key: Signatures.getPublicKey(privateKey, SignatureScheme.ECDSA_SECP256K1),
          scheme: SignatureScheme.ECDSA_SECP256K1,
        };
        const ownerAddress = getEVMAddressFromPublicKey(publicKey.key);

        account.address = await this.factoryContract['getAddress(address,uint256)'](
          ownerAddress,
          DEPLOY_SALTS_MVP.SIMPLE_ACCOUNT,
        );
        break;
      }
      default:
        throw AccountPackageErrors.MissingAccountType;
    }
    if (account.address == '') throw AccountPackageErrors.MissingAddress;
    this.accounts.push(account);
    return account;
  }

  public async removeAllAccounts(): Promise<void> {
    this.accounts = [];
    this.#keyring = new HDKeyring();
  }

  public async getAccounts(type: AccountType): Promise<Account[]> {
    return this.accounts.filter((acc) => acc.type == type);
  }

  public async getAllAccounts(): Promise<Account[]> {
    return this.accounts;
  }

  public async isAccountDeployed(account: Account): Promise<boolean> {
    switch (account.type) {
      case AccountType.EVM: {
        return Promise.resolve((await this.provider.getCode(account.address)) != '0x');
      }
      default: {
        throw new Error();
      }
    }
  }

  public async getAccountInitCode(account: Account) {
    const pubKey = await this.getPublicKeyForAccount(account);
    const owner = getEVMAddressFromPublicKey(pubKey.key);
    const encodeData = this.factoryContract.interface.encodeFunctionData('createAccount', [
      owner,
      DEPLOY_SALTS_MVP.SIMPLE_ACCOUNT,
    ]);
    return concat([this.config.addresses.accountFactory, encodeData]);
  }

  public async getOwnerAddress(account: Account): Promise<string> {
    const pubKey = await this.getPublicKeyForAccount(account);
    return Promise.resolve(getEVMAddressFromPublicKey(pubKey.key));
  }

  public async signMessage(message: BytesLike, account: Account): Promise<Signature> {
    if (!(message instanceof Uint8Array)) message = toUtf8Bytes(message);
    const publicKey = await this.getPublicKeyForAccount(account);
    return this.#keyring.sign(message, publicKey);
  }

  public async signUserOp(userOp: UserOperationStruct, account: Account): Promise<BytesLike> {
    const publicKey = await this.getPublicKeyForAccount(account);

    const entrypoint = this.config.addresses.entrypoint;
    const chainId = this.config.chainId;
    const userOpHash = this.getUserOpHash(userOp, entrypoint, chainId);
    const msg =
      Buffer.from('\x19Ethereum Signed Message:\n32').toString('hex') + userOpHash.slice(2);
    const sig = await this.#keyring.sign(getBytes('0x' + msg), publicKey);
    return toRpcSig(sig.v || BigInt(0), sig.r, sig.s);
  }

  packUserOp(op: UserOperationStruct, forSignature = true): string {
    if (forSignature) {
      return AbiCoder.defaultAbiCoder().encode(
        [
          'address',
          'uint256',
          'bytes32',
          'bytes32',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'bytes32',
        ],
        [
          op.sender,
          op.nonce,
          keccak256(op.initCode),
          keccak256(op.callData),
          op.callGasLimit,
          op.verificationGasLimit || 0,
          op.preVerificationGas || 0,
          op.maxFeePerGas || 0,
          op.maxPriorityFeePerGas || 0,
          keccak256(op.paymasterAndData),
        ],
      );
    } else {
      // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
      return AbiCoder.defaultAbiCoder().encode(
        [
          'address',
          'uint256',
          'bytes',
          'bytes',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'bytes',
          'bytes',
        ],
        [
          op.sender,
          op.nonce,
          op.initCode,
          op.callData,
          op.callGasLimit,
          op.verificationGasLimit || 0,
          op.preVerificationGas || 0,
          op.maxFeePerGas || 0,
          op.maxPriorityFeePerGas || 0,
          op.paymasterAndData,
          op.signature,
        ],
      );
    }
  }

  getUserOpHash(op: UserOperationStruct, entryPoint: string, chainId: number): string {
    const userOpHash = keccak256(this.packUserOp(op, true));
    const enc = AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'address', 'uint256'],
      [userOpHash, entryPoint, chainId],
    );
    return keccak256(enc);
  }

  async getPublicKeyForAccount(account: Account): Promise<PublicKey> {
    switch (account.type) {
      case AccountType.EVM: {
        const accountContract = new Contract(
          account.address,
          JSON.stringify(AccountAbi),
          this.provider,
        );
        const deployedOwner = (await this.isAccountDeployed(account))
          ? await accountContract.owner()
          : '';

        const publicKeys = await this.#keyring.getPublicKeys(SignatureScheme.ECDSA_SECP256K1);
        const publicKey = await Promise.all(
          publicKeys.map(async (pubKey) => {
            const ownerAddress = getEVMAddressFromPublicKey(pubKey.key);
            if (deployedOwner == '') {
              const accountAddress = await this.factoryContract['getAddress(address,uint256)'](
                ownerAddress,
                BigInt(DEPLOY_SALTS_MVP.SIMPLE_ACCOUNT),
              );
              if (
                account.address.toString().toLowerCase() == accountAddress.toString().toLowerCase()
              )
                return pubKey;
            } else {
              if (ownerAddress.toString().toLowerCase() == deployedOwner.toString().toLowerCase())
                return pubKey;
            }
          }),
        );
        if (publicKey.length == 0 || publicKey[0] == undefined)
          throw new Error('Missing key in keyring');
        return publicKey[0];
      }
      default: {
        throw new Error('Account type is not supported');
      }
    }
  }

  public async getRecoveryData(): Promise<WalletInfo> {
    if (!this.info) throw Error(AccountPackageErrors.MissingInfo);
    return {
      strategy: this.info.strategy,
      state: {
        keyringState: {
          mnemonic: this.#keyring.mnemonic,
          numberOfKeys: await this.#keyring.getNumberOfKeys(),
        },
        accounts: this.accounts,
      },
      encrypted: false,
    };
  }
}
