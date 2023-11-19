/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZERO_ACCOUNT } from '@peter-present/user-operation-type';
import {
  BigNumberish,
  BytesLike,
  ContractMethodArgs,
  FunctionFragment,
  InterfaceAbi,
  concat,
  ethers,
  hexlify,
} from 'ethers';
import { AccountAbi } from './abis/account.js';

export class CallData {
  static encode(to: string, value: BigNumberish, dataCall: BytesLike) {
    const inter = new ethers.Interface(AccountAbi);
    return inter.encodeFunctionData('execute', [to, value, dataCall]);
  }

  static transfer(to: string, value: BigNumberish) {
    return this.encode(to, value, '0x00');
  }

  static deployContract<A extends Array<any> = Array<any>>(
    abi: InterfaceAbi,
    bytecode: BytesLike,
    args: ContractMethodArgs<A>,
  ) {
    const contractAbi = new ethers.Interface(abi);
    const constructorEncodedData = contractAbi.encodeDeploy(args);
    const dataCall = hexlify(concat([bytecode, constructorEncodedData]));
    return this.encode(ZERO_ACCOUNT, '0x00', dataCall);
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
