/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumberish, BytesLike, TransactionReceipt } from 'ethers';

export type UserOperationStruct = {
  sender: string;
  nonce: BigNumberish;
  initCode: BytesLike;
  callData: BytesLike;
  callGasLimit: BigNumberish;
  verificationGasLimit: BigNumberish;
  preVerificationGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  maxPriorityFeePerGas: BigNumberish;
  paymasterAndData: BytesLike;
  signature: BytesLike;
};

export type EstimatedUserOperationGas = {
  preVerificationGas: BigNumberish;
  callGasLimit: BigNumberish;
  verificationGas: BigNumberish;
  deadline?: BigNumberish;
};

export type UserOperationByHashResponse = {
  userOperation: UserOperationStruct;
  entryPoint: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
};

export type UserOperationReceipt = {
  userOpHash: string;
  sender: string;
  nonce: BigNumberish;
  paymaster?: string;
  actualGasCost: BigNumberish;
  actualGasUsed: BigNumberish;
  success: boolean;
  reason?: string;
  logs: any[];
  receipt: TransactionReceipt;
};

export interface StakeInfo {
  addr: string;
  stake: BigNumberish;
  unstakeDelaySec: BigNumberish;
}
