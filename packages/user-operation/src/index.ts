import { Account, AccountAbi, UserOperationStruct } from '@peter-present/user-operation-type';
import { BigNumberish, BytesLike, Contract } from 'ethers';
import { UserOperationEth } from './user-operation-eth.js';

export * from './estimate-gas-fee.js';
export * from './estimate-operation-gas.js';
export * from './user-operation-eth.js';

type BuildParamType = {
  accountFactoryAddress?: string;
  paymasterAddress?: string;
  initCode?: string;
};

export class UserOperation {
  account: Account;
  callData: BytesLike;
  paymasterAndData: BytesLike;
  rpcUrl: string;

  verificationGasLimit?: BigNumberish;
  preVerificationGas?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
  callGasLimit?: BigNumberish;

  private userOperationEth: UserOperationEth;

  constructor(
    account: Account,
    callData: BytesLike,
    paymasterAndData: BytesLike,
    rpcUrl: string,
    chainId: string | number,
  ) {
    this.account = account;
    this.callData = callData;
    this.paymasterAndData = paymasterAndData;
    this.rpcUrl = rpcUrl;
    this.userOperationEth = new UserOperationEth(rpcUrl, chainId);
  }

  async build(entrypointAddress: string, params?: BuildParamType): Promise<UserOperationStruct> {
    const _paymasterAddress = params?.paymasterAddress ?? '0x';

    const accountContract = new Contract(
      this.account.address,
      JSON.stringify(AccountAbi),
      this.userOperationEth.provider,
    );
    let _nonce = 0;
    const isDeploy = await this.userOperationEth.provider.getCode(this.account.address);
    if (isDeploy != '0x') _nonce = parseInt(await accountContract.nonce());
    const _initCode = _nonce == 0 ? params?.initCode ?? '0x' : '0x';
    const estimatedUserOperation = {
      sender: this.account.address,
      nonce: _nonce,
      initCode: _initCode,
      callData: this.callData,
      callGasLimit: 0,
      verificationGasLimit: 100000,
      preVerificationGas: 21000,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 1e9,
      paymasterAndData: this.paymasterAndData,
      signature: '0x',
    };
    const estimateGasData = await this.userOperationEth.estimateGas.estimateGas(
      estimatedUserOperation,
      entrypointAddress,
    );
    const estimateGasFee = await this.userOperationEth.estimateGasFee.estimateEIP1559Fee();
    return {
      ...estimatedUserOperation,
      verificationGasLimit: estimateGasData.verificationGasLimit,
      // preVerificationGas: estimateGasData.preVerificationGas,
      maxFeePerGas: estimateGasFee.gwei.maxFeePerGas,
      maxPriorityFeePerGas: estimateGasFee.gwei.maxPriorityFeePerGas,
      paymasterAndData: _paymasterAddress,
      callGasLimit: estimateGasData.callGasLimit,
    } as UserOperationStruct;
  }
}
