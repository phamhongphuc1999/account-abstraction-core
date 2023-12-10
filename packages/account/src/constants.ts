export interface NetworkObject {
  chainId: number;
  addresses: {
    entrypoint: string;
    accountFactory: string;
    paymaster: string;
  };
}

export const DEPLOY_SALTS_MVP = {
  SIMPLE_ACCOUNT: '0x'.padEnd(66, '0'),
};
