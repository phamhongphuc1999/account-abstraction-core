export type SupportNetworks = 'goerli' | 'sepolia' | 'bsctestnet';
export const CHAIN_ALIASES = {
  BSC_TESTNET: 97,
  GOERLI: 5,
  SEPOLIA: 11155111,
};
export interface NetworkObject {
  chainId: number;
  addresses: {
    entrypoint: string;
    accountFactory: string;
    paymaster: string;
  };
}

export const DEPLOY_SALTS_MVP = {
  SIMPLE_ACCOUNT: 0,
};

type NetworkConfigParams = {
  [network in SupportNetworks]: NetworkObject;
};

export const NetworkConfig: NetworkConfigParams = {
  goerli: {
    chainId: CHAIN_ALIASES.GOERLI,
    addresses: {
      entrypoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      accountFactory: '0x5E4034D9b0F118047EF731AA90A3f177889E312E',
      paymaster: '0x85047eBC2698c42329adE0C9B8EFd07b639BcBCa',
    },
  },
  sepolia: {
    chainId: CHAIN_ALIASES.SEPOLIA,
    addresses: {
      entrypoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      accountFactory: '0x397559AEc4C800F5D1223431c818b83D585AD9ba',
      paymaster: '0x61aB91d929119931d6C6bEd2F09586429DD90fd8',
    },
  },
  bsctestnet: {
    chainId: CHAIN_ALIASES.BSC_TESTNET,
    addresses: {
      entrypoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      accountFactory: '0x397559AEc4C800F5D1223431c818b83D585AD9ba',
      paymaster: '0x61aB91d929119931d6C6bEd2F09586429DD90fd8',
    },
  },
};
