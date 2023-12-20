import { PrivateKey, PublicKey, SerializedHdKeyringState } from './keyring.js';

export enum WalletStrategy {
  SIMPLE = 'Simple Wallet',
  WEB2 = 'Web2 Social Wallet',
  WEB3 = 'Web3 External Wallet',
}

export enum AccountType {
  EVM = 'EVM',
}

export type WalletInfo = {
  strategy: WalletStrategy;
  state?: AccountState;
  encrypted: boolean;
};

export type AccountConfigType = {
  rpcUrl?: string;
  factoryAddress: string;
  own: {
    privateKey: PrivateKey;
    publicKey: PublicKey;
  };
};

export abstract class AbstractionAccount {
  abstract address: string;
  abstract type: AccountType;
  abstract publicKey: PublicKey;

  abstract connect(rpcUrl: string): void;
  abstract isDeploy(): Promise<boolean>;
  abstract getOwner(): string;
  abstract getInitCode(): string;
  abstract sign(message: Uint8Array): string;
}

export type AccountState = {
  keyringState: SerializedHdKeyringState;
  accounts?: AbstractionAccount[];
};
