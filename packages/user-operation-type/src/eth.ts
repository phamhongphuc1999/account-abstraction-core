export type BlockTag = 'earliest' | 'finalized' | 'safe' | 'latest' | 'pending';
export type PROVIDER_TYPES = 'goerli' | 'localhost' | 'mainnet' | 'rpc' | 'sepolia';
export type OptionType = { max: number; start: number };

export type SyncingObject = {
  startingBlock: string;
  currentBlock: string;
  highestBlock: string;
};

export type SyncingType = SyncingObject | boolean;

export type BlockDataTransaction = Array<string> | Array<EthTransaction>;

export type EthBlock = {
  parentHash: string;
  sha3Uncles: string;
  miner: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  logsBloom: string;
  difficulty?: string;
  number: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  extraData: string;
  mixHash: string;
  nonce: string;
  totalDifficulty?: string;
  baseFeePerGas?: string;
  size: string;
  transactions: BlockDataTransaction;
  uncles?: Array<string>;
  hash: string;
};

export type RawTransaction = {
  type?: string;
  nonce?: string;
  to?: string;
  from?: string;
  gas?: string;
  value?: string;
  data?: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  accessList?: Array<{ address: string; storageKeys: Array<string> }>;
  chainId?: string;
};

export type GasUsed = {
  accessList?: Array<{ address: string; storageKeys: Array<string> }>;
  error?: string;
  gasUsed?: string;
};

export type FeeHistoryResult = {
  oldestBlock: string;
  baseFeePerGas: Array<string>;
  reward: Array<Array<string>>;
};

export type Filter = {
  fromBlock?: string;
  toBlock?: string;
  address?: string | Array<string>;
  topics?: Array<null | string | Array<string>>;
};

export type LogType = {
  removed?: boolean;
  logIndex?: string;
  transactionIndex?: string;
  transactionHash: string;
  blockHash?: string;
  blockNumber?: string;
  address?: string;
  data?: string;
  topics?: Array<string>;
};

export type AccountProofType = {
  address: string;
  accountProof?: Array<string>;
  balance: string;
  codeHash: string;
  nonce: string;
  storageHash: string;
  storageProof: Array<{ key: string; value: string; proof: Array<string> }>;
};

export type EthTransaction = {
  hash: string;
  type: string;
  nonce: string;
  from?: string;
  to?: string;
  gas: string;
  value: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  gasPrice?: string;
  accessList?: Array<{ address: string; storageKeys: Array<string> }>;
  chainId: string;
  yParity: string;
  v?: string;
  r: string;
  s: string;
};

export type TransactionReceipt = {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to?: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress: string | null;
  logs: Array<LogType>;
  logsBloom: string;
  root?: string;
  status?: string;
  effectiveGasPRice?: string;
};
