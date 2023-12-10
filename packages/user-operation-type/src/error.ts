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

export const errorCodes = {
  rpc: {
    invalidInput: -32000,
    resourceNotFound: -32001,
    resourceUnavailable: -32002,
    transactionRejected: -32003,
    methodNotSupported: -32004,
    limitExceeded: -32005,
    parse: -32700,
    invalidRequest: -32600,
    methodNotFound: -32601,
    invalidParams: -32602,
    internal: -32603,
  },
  provider: {
    userRejectedRequest: 4001,
    unauthorized: 4100,
    unsupportedMethod: 4200,
    disconnected: 4900,
    chainDisconnected: 4901,
  },
};

export const errorValues = {
  '-32700': {
    standard: 'JSON RPC 2.0',
    message:
      'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
  },
  '-32600': {
    standard: 'JSON RPC 2.0',
    message: 'The JSON sent is not a valid Request object.',
  },
  '-32601': {
    standard: 'JSON RPC 2.0',
    message: 'The method does not exist / is not available.',
  },
  '-32602': {
    standard: 'JSON RPC 2.0',
    message: 'Invalid method parameter(s).',
  },
  '-32603': {
    standard: 'JSON RPC 2.0',
    message: 'Internal JSON-RPC error.',
  },
  '-32000': {
    standard: 'EIP-1474',
    message: 'Invalid input.',
  },
  '-32001': {
    standard: 'EIP-1474',
    message: 'Resource not found.',
  },
  '-32002': {
    standard: 'EIP-1474',
    message: 'Resource unavailable.',
  },
  '-32003': {
    standard: 'EIP-1474',
    message: 'Transaction rejected.',
  },
  '-32004': {
    standard: 'EIP-1474',
    message: 'Method not supported.',
  },
  '-32005': {
    standard: 'EIP-1474',
    message: 'Request limit exceeded.',
  },
  '4001': {
    standard: 'EIP-1193',
    message: 'User rejected the request.',
  },
  '4100': {
    standard: 'EIP-1193',
    message: 'The requested account and/or method has not been authorized by the user.',
  },
  '4200': {
    standard: 'EIP-1193',
    message: 'The requested method is not supported by this Ethereum provider.',
  },
  '4900': {
    standard: 'EIP-1193',
    message: 'The provider is disconnected from all chains.',
  },
  '4901': {
    standard: 'EIP-1193',
    message: 'The provider is disconnected from the specified chain.',
  },
};

export class RpcError extends Error {
  constructor(msg: string, readonly code?: number, readonly data: any = undefined) {
    super(msg);
  }
}
