/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EXECUTION_REVERTED,
  EntryPointAbi,
  RpcError,
  UserOperationStruct,
  ZERO_ACCOUNT,
} from '@peter-present/user-operation-type';
import BigNumber from 'bignumber.js';
import { BigNumberish, Contract, Interface, ethers, getBytes, hexlify } from 'ethers';
import { callDataCost, fillEntity, hexDataSlice, packUserOp, toHex } from './utils.js';

export const DefaultGasOverheads = {
  fixed: 21000,
  perUserOp: 18300,
  perUserOpWord: 4,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65,
};

export const DefaultsForUserOp: UserOperationStruct = {
  sender: ZERO_ACCOUNT,
  nonce: 0,
  initCode: '0x',
  callData: '0x',
  callGasLimit: 0,
  verificationGasLimit: 100000,
  preVerificationGas: 21000,
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  paymasterAndData: '0x',
  signature: '0x',
};

export class EstimateOperationGas {
  provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  private calcPreVerificationGas(
    userOp: Partial<UserOperationStruct>,
    overheads?: Partial<typeof DefaultGasOverheads>,
  ): number {
    const ov = { ...DefaultGasOverheads, ...(overheads ?? {}) };
    const p: UserOperationStruct = {
      preVerificationGas: 21000,
      signature: hexlify(Buffer.alloc(ov.sigSize, 1)),
      ...userOp,
    } as any;
    const packed = getBytes(packUserOp(p, false));
    const callDataCost = packed
      .map((x) => (x === 0 ? ov.zeroByte : ov.nonZeroByte))
      .reduce((sum, x) => sum + x);
    const ret = Math.round(
      callDataCost + ov.fixed / ov.bundleSize + ov.perUserOp + ov.perUserOpWord * packed.length,
    );
    return ret;
  }

  private async callSimulateValidation(userOp: UserOperationStruct, entryPointAddress: string) {
    const contract = new Contract(entryPointAddress, JSON.stringify(EntryPointAbi), this.provider);
    const error = await contract.simulateValidation
      .staticCall(userOp, { gasLimit: 10e6 })
      .catch((error: any) => error);
    const inter = new Interface(EntryPointAbi);
    const validationResultError = inter.getError('ValidationResult');
    const bytes: string = error.data.toString();
    if (bytes.slice(0, 10) == validationResultError?.selector) {
      const result = inter.decodeErrorResult('ValidationResult', bytes);
      const returnInfo = result.returnInfo;
      const senderInfo = result.senderInfo;
      const factoryInfo = result.factoryInfo;
      const paymasterInfo = result.paymasterInfo;
      return {
        returnInfo,
        senderInfo: { ...senderInfo, addr: userOp.sender },
        factoryInfo: fillEntity(userOp.initCode, factoryInfo),
        paymasterInfo: fillEntity(userOp.paymasterAndData, paymasterInfo),
      };
    }
    throw new Error('Error!');
  }

  async estimateSimulateGas(userOp: UserOperationStruct, entryPointAddress: string) {
    const userOpComplemented: UserOperationStruct = {
      ...userOp,
      paymasterAndData: '0x',
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
      preVerificationGas: 0,
      verificationGasLimit: 10e6,
    };
    const { returnInfo } = await this.callSimulateValidation(userOpComplemented, entryPointAddress);
    const callGasLimit = await this.provider
      .estimateGas({ from: entryPointAddress, to: userOp.sender, data: userOp.callData.toString() })
      .then((b) => b)
      .catch((err) => {
        const msg = err.message.match(/reason="(.*?)"/)?.at(1) ?? 'Execution reverted';
        throw new RpcError(msg, EXECUTION_REVERTED);
      });
    const preVerificationGas = this.calcPreVerificationGas(userOp);
    const verificationGas = `0x${BigNumber(returnInfo.preOpGas).toString(16)}`;
    let deadline: any = undefined;
    if (returnInfo.deadline) deadline = BigNumber(returnInfo.deadline);
    return {
      preVerificationGas: `0x${BigNumber(preVerificationGas).toString(16)}`,
      verificationGasLimit: verificationGas,
      callGasLimit: `0x${callGasLimit.toString(16)}`,
      deadline: deadline,
    };
  }

  private fillUserOpDefault(
    op: Partial<UserOperationStruct>,
    defaults = DefaultsForUserOp,
  ): UserOperationStruct {
    const partial: any = { ...op };
    for (const key in partial) {
      if (partial[key] == null) delete partial[key];
    }
    const filled = { ...defaults, ...partial };
    return filled;
  }

  async estimateGas(userOp: Partial<UserOperationStruct>, entryPointAddress: string) {
    let callGasLimit: BigNumberish = 0;
    if (userOp.callData != null) {
      callGasLimit = await this.provider.estimateGas({
        from: entryPointAddress,
        to: userOp.sender,
        data: userOp.callData.toString(),
      });
    }
    let verificationGasLimit = BigNumber(100000);
    if (userOp.initCode != null && userOp.initCode != '0x') {
      const initAddr = hexDataSlice(userOp.initCode, 0, 20);
      const initCallData = hexDataSlice(userOp.initCode, 20);
      const initEstimate = await this.provider.estimateGas({
        from: entryPointAddress,
        to: initAddr,
        data: initCallData,
        gasLimit: 10e6,
      });
      verificationGasLimit = verificationGasLimit.plus(initEstimate.toString());
    }
    const preVerificationGas = callDataCost(packUserOp(this.fillUserOpDefault(userOp), false));
    return {
      callGasLimit: toHex(callGasLimit),
      verificationGasLimit: toHex(verificationGasLimit),
      preVerificationGas,
    };
  }
}
