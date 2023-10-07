/* eslint-disable @typescript-eslint/no-explicit-any */
import { StakeInfo, UserOperationStruct } from '@peter-present/user-operation-type';
import BigNumber from 'bignumber.js';
import {
  AbiCoder,
  BigNumberish,
  BytesLike,
  Interface,
  concat,
  getBytes,
  hexlify,
  isHexString,
  keccak256,
} from 'ethers';
import { AccountFactoryAbi } from './abis/account-factory';

export function packUserOp(op: UserOperationStruct, forSignature = true): string {
  if (forSignature) {
    return AbiCoder.defaultAbiCoder().encode(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes32',
      ],
      [
        op.sender,
        op.nonce,
        keccak256(op.initCode),
        keccak256(op.callData),
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        keccak256(op.paymasterAndData),
      ],
    );
  } else {
    // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
    return AbiCoder.defaultAbiCoder().encode(
      [
        'address',
        'uint256',
        'bytes',
        'bytes',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes',
        'bytes',
      ],
      [
        op.sender,
        op.nonce,
        op.initCode,
        op.callData,
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymasterAndData,
        op.signature,
      ],
    );
  }
}

export function getUserOpHash(
  op: UserOperationStruct,
  entryPoint: string,
  chainId: number,
): string {
  const userOpHash = keccak256(packUserOp(op, true));

  const enc = AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'address', 'uint256'],
    [userOpHash, entryPoint, chainId],
  );
  return keccak256(enc);
}

export function getAddr(data?: BytesLike): string | undefined {
  if (data == null) return undefined;
  const str = hexlify(data);
  if (str.length >= 42) return str.slice(0, 42);
  return undefined;
}

export function fillEntity(data: BytesLike, info: StakeInfo): StakeInfo | null {
  const addr = getAddr(data);
  return addr == null ? null : { ...info, addr };
}

export function getAccountInitCode(owner: string, accountFactoryAddress: string, salt = 0) {
  const inter = new Interface(AccountFactoryAbi);
  const encodeData = inter.encodeFunctionData('createAccount', [owner, salt]);
  return concat([accountFactoryAddress, encodeData]);
}

export function callDataCost(data: string): number {
  return getBytes(data)
    .map((x) => (x === 0 ? 4 : 16))
    .reduce((sum, x) => x + sum);
}

export function hexDataSlice(data: BytesLike, offset: number, endOffset?: number): string {
  if (typeof data !== 'string') {
    data = hexlify(data);
  } else if (!isHexString(data) || data.length % 2) {
    throw new Error('abc');
  }
  offset = 2 + 2 * offset;
  if (endOffset != null) {
    return '0x' + data.substring(offset, 2 + 2 * endOffset);
  }
  return '0x' + data.substring(offset);
}

export function toHex(data: BigNumberish | BigNumber): string {
  const rawResult = data.toString(16);
  if (rawResult.slice(0, 1) != '0x') return `0x${rawResult}`;
  return rawResult;
}
