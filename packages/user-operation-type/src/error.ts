/* eslint-disable @typescript-eslint/no-explicit-any */
export const INVALID_USEROP = -32602;
export const VALIDATION_FAILED = -32500;
export const REJECTED_BY_PAYMASTER = -32501;
export const INVALID_OPCODE = -32502;
export const USEROP_EXPIRED = -32503;
export const PAYMASTER_OR_AGGREGATOR_BANNED = -32504;
export const STAKE_DELAY_TOO_LOW = -32505;
export const INVALID_SIGNATURE_AGGREGATOR = -32506;

export const PARSE_ERROR = -32700;
export const INVALID_REQUEST = -32600;
export const METHOD_NOT_FOUND = -32601;
export const INTERNAL_ERROR = -32603;
export const EXECUTION_REVERTED = -32521;

export class RpcError extends Error {
  constructor(msg: string, readonly code?: number, readonly data: any = undefined) {
    super(msg);
  }
}