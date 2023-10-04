export const DEPLOY_SALTS_MVP = {
  // SIMPLE_ACCOUNT: toBeHex(keccak256(toUtf8Bytes('SimpleAccount'))),
  SIMPLE_ACCOUNT: 0,
};

export const ADDRESSES = {
  ethereum: {
    EntryPoint: '',
    AccountFactory: '',
    Oracle: '',
    Paymaster: '',
  },
  goerli: {
    EntryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    AccountFactory: '0x5E4034D9b0F118047EF731AA90A3f177889E312E',
    Oracle: '0x397559AEc4C800F5D1223431c818b83D585AD9ba',
    Paymaster: '0x85047eBC2698c42329adE0C9B8EFd07b639BcBCa',
  },
  sepolia: {
    EntryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    AccountFactory: '0x397559AEc4C800F5D1223431c818b83D585AD9ba',
    Oracle: '0x74141E017B7BaA5373078e55A85bcAE5e87B1319',
    Paymaster: '0x61aB91d929119931d6C6bEd2F09586429DD90fd8',
  },
};
