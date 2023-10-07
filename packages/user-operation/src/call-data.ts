/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumberish, FunctionFragment, InterfaceAbi, ethers } from 'ethers';
import { AccountAbi } from './abis/account.js';

export class CallData {
  static encodeTransferCallData(to: string, value: BigNumberish) {
    const inter = new ethers.Interface(AccountAbi);
    return inter.encodeFunctionData('execute', [to, value, '0x00']);
  }

  static encodeFunctionData(
    abi: InterfaceAbi,
    fragment: FunctionFragment | string,
    values?: ReadonlyArray<any>,
  ) {
    const inter = new ethers.Interface(abi);
    return inter.encodeFunctionData(fragment, values);
  }
}
