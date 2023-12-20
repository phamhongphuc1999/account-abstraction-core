import {
  AbstractionAccount,
  AccountConfigType,
  AccountFactoryAbi,
  AccountType,
  PrivateKey,
  PublicKey,
} from '@peter-present/user-operation-type';
import { Contract, JsonRpcProvider, concat, isAddress, solidityPacked } from 'ethers';
import { DEPLOY_SALTS_MVP } from '../constants.js';
import { Signatures } from '../keyring/index.js';
import { getEVMAddressFromPublicKey } from '../utils.js';

export class SimpleAccount implements AbstractionAccount {
  public address: string;
  public type: AccountType;
  private provider: JsonRpcProvider;
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
    this._factoryContract = new Contract(
      factoryAddress,
      JSON.stringify(AccountFactoryAbi),
      this.provider,
    );
  }

  connect(rpcUrl: string) {
    this.provider = new JsonRpcProvider(rpcUrl);
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

  sign(message: Uint8Array): string {
    const { r, s, v } = Signatures.sign(message, this.privateKey, this.publicKey.scheme);
    return solidityPacked(
      v ? ['bytes', 'bytes', 'string'] : ['bytes', 'bytes'],
      v ? [r, s, v] : [r, s],
    );
  }
}
