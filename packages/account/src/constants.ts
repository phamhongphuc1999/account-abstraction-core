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
