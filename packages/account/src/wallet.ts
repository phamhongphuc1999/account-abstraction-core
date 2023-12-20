import { toRpcSig } from '@ethereumjs/util';
import {
  AbstractionAccount,
  AccountFactoryAbi,
  AccountState,
  AccountType,
  PrivateKey,
  PublicKey,
  SignatureScheme,
  UserOperationStruct,
  WalletInfo,
  WalletStrategy,
} from '@peter-present/user-operation-type';
import { AbiCoder, BytesLike, Contract, ethers, getBytes, keccak256 } from 'ethers';
import { SimpleAccount } from './accounts/simple-account.js';
import { DEPLOY_SALTS_MVP, NetworkObject } from './constants.js';
import { AccountPackageErrors } from './errors.js';
import { HDKeyring, Signatures } from './keyring/index.js';
import { getEVMAddressFromPublicKey } from './utils.js';

interface InitialParams {
  rpcUrl: string;
  networkConfig: NetworkObject;
}

export class Wallet {
  info!: WalletInfo;
  accounts: AbstractionAccount[];
  keyring: HDKeyring;
  config: NetworkObject;
  factoryContract!: Contract;
  private rpcUrl: string;
  provider: ethers.JsonRpcProvider;

  constructor(params: InitialParams) {
    const { rpcUrl, networkConfig } = params;
    this.config = networkConfig;

    this.accounts = [];

    this.keyring = new HDKeyring();
    this.rpcUrl = rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.factoryContract = new Contract(
      this.config.addresses.accountFactory,
      JSON.stringify(AccountFactoryAbi),
      this.provider,
    );
  }

  public async createKeyring(password: string, info: WalletInfo): Promise<WalletInfo> {
    if (!password || !password.length) throw new Error(AccountPackageErrors.MissingPassword);
    this.keyring.generateRandomMnemonic();
    const state: AccountState = {
      keyringState: { mnemonic: this.keyring.mnemonic, numberOfKeys: 0 },
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
        this.keyring.deserialize(info.state?.keyringState);
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

  public async addAccount(type: AccountType): Promise<AbstractionAccount> {
    let account: AbstractionAccount | null = null;

    switch (type) {
      case AccountType.EVM: {
        const privateKey: PrivateKey = (await this.keyring.addKeys(1))[0];
        const publicKey: PublicKey = {
          key: Signatures.getPublicKey(privateKey, SignatureScheme.ECDSA_SECP256K1),
          scheme: SignatureScheme.ECDSA_SECP256K1,
        };
        const ownerAddress = getEVMAddressFromPublicKey(publicKey.key);
        const address = await this.factoryContract['getAddress(address,uint256)'](
          ownerAddress,
          DEPLOY_SALTS_MVP.SIMPLE_ACCOUNT,
        );
        account = new SimpleAccount(address, type, {
          rpcUrl: this.rpcUrl,
          factoryAddress: this.config.addresses.accountFactory,
          own: { privateKey, publicKey },
        });
        break;
      }
      default:
        throw AccountPackageErrors.MissingAccountType;
    }
    if (account == null) throw AccountPackageErrors.MissingAddress;
    this.accounts.push(account);
    return account;
  }

  public removeAllAccounts() {
    this.accounts = [];
    this.keyring = new HDKeyring();
  }

  public getAccounts(type: AccountType): AbstractionAccount[] {
    return this.accounts.filter((account) => account.type == type);
  }

  public getAllAccounts(): AbstractionAccount[] {
    return this.accounts;
  }

  public async signUserOp(
    userOp: UserOperationStruct,
    account: AbstractionAccount,
  ): Promise<BytesLike> {
    const entrypoint = this.config.addresses.entrypoint;
    const chainId = this.config.chainId;
    const userOpHash = this.getUserOpHash(userOp, entrypoint, chainId);
    const msg =
      Buffer.from('\x19Ethereum Signed Message:\n32').toString('hex') + userOpHash.slice(2);
    const sig = await this.keyring.sign(getBytes('0x' + msg), account.publicKey);
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

  public async getRecoveryData(): Promise<WalletInfo> {
    if (!this.info) throw Error(AccountPackageErrors.MissingInfo);
    return {
      strategy: this.info.strategy,
      state: {
        keyringState: {
          mnemonic: this.keyring.mnemonic,
          numberOfKeys: await this.keyring.getNumberOfKeys(),
        },
        accounts: this.accounts,
      },
      encrypted: false,
    };
  }
}
