import { Types as KeyringTypes } from './keyring/index.js';

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

export type Account = {
  address: string;
  type: AccountType;
};

export type AccountState = {
  keyringState: KeyringTypes.SerializedHdKeyringState;
  accounts?: Account[];
};
