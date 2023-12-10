import {
  AbstractionAccount,
  AccountAbi,
  AccountConfigType,
  AccountFactoryAbi,
  AccountType,
  PrivateKey,
  PublicKey,
  Signature,
} from '@peter-present/user-operation-type';
import { Contract, JsonRpcProvider, concat, isAddress } from 'ethers';
import { DEPLOY_SALTS_MVP } from '../constants.js';
import { Signatures } from '../keyring/index.js';
import { getEVMAddressFromPublicKey } from '../utils.js';

export class SimpleAccount implements AbstractionAccount {
  public address: string;
  public type: AccountType;
  private provider: JsonRpcProvider;
  private _contract: Contract;
  private _factoryAddress: string;
  private _factoryContract: Contract;

  private privateKey: PrivateKey;
  public publicKey: PublicKey;

  constructor(address: string, type: AccountType, config: AccountConfigType) {
    const { rpcUrl, factoryAddress, own } = config;
    if (!isAddress(address) || !isAddress(factoryAddress)) throw Error('Invalid address');
    this.privateKey = own.privateKey;
    this.publicKey = own.publicKey;

    this.address = address;
    this.type = type;
    this._factoryAddress = factoryAddress;
    this.provider = new JsonRpcProvider(rpcUrl);
    this._contract = new Contract(address, JSON.stringify(AccountAbi), this.provider);
    this._factoryContract = new Contract(
      factoryAddress,
      JSON.stringify(AccountFactoryAbi),
      this.provider,
    );
  }

  connect(rpcUrl: string) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this._contract = new Contract(this.address, JSON.stringify(AccountAbi), this.provider);
  }

  async isDeploy(): Promise<boolean> {
    const code = await this.provider.getCode(this.address);
    return code != '0x';
  }

  getOwner(): string {
    return getEVMAddressFromPublicKey(this.publicKey.key);
  }

  getInitCode(): string {
    const owner = getEVMAddressFromPublicKey(this.publicKey.key);
    const encodeData = this._factoryContract.interface.encodeFunctionData('createAccount', [
      owner,
      DEPLOY_SALTS_MVP.SIMPLE_ACCOUNT,
    ]);
    return concat([this._factoryAddress, encodeData]);
  }

  sign(message: Uint8Array): Signature {
    return Signatures.sign(message, this.privateKey, this.publicKey.scheme);
  }
}
