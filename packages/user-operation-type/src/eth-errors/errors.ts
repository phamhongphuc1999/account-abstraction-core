import { EthereumProviderError, EthereumRpcError } from './classes.js';
import { getMessageFromCode } from './utils.js';
import { Json } from '../query.js';

type EthereumErrorOptions<T extends Json> = {
  message?: string;
  data?: T;
};

type ServerErrorOptions<T extends Json> = {
  code: number;
} & EthereumErrorOptions<T>;

type CustomErrorArg<T extends Json> = ServerErrorOptions<T>;

type EthErrorsArg<T extends Json> = EthereumErrorOptions<T> | string;

function parseOpts<T extends Json>(
  arg?: EthErrorsArg<T>,
): [message?: string | undefined, data?: T | undefined] {
  if (arg) {
    if (typeof arg === 'string') return [arg];
    else if (typeof arg === 'object' && !Array.isArray(arg)) {
      const { message, data } = arg;
      if (message && typeof message !== 'string') throw new Error('Must specify string message.');
      return [message || undefined, data];
    }
  }
  return [];
}

function getEthJsonRpcError<T extends Json>(
  code: number,
  arg?: EthErrorsArg<T>,
): EthereumRpcError<T> {
  const [message, data] = parseOpts(arg);
  return new EthereumRpcError(code, message || getMessageFromCode(code), data);
}

function getEthProviderError<T extends Json>(
  code: number,
  arg?: EthErrorsArg<T>,
): EthereumProviderError<T> {
  const [message, data] = parseOpts(arg);
  return new EthereumProviderError(code, message || getMessageFromCode(code), data);
}

export const ethErrors = {
  rpc: {
    parse: <T extends Json>(arg?: EthErrorsArg<T>) => getEthJsonRpcError(errorCodes.rpc.parse, arg),
    invalidRequest: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.invalidRequest, arg),
    invalidParams: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.invalidParams, arg),
    methodNotFound: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.methodNotFound, arg),
    internal: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.internal, arg),
    server: <T extends Json>(opts: ServerErrorOptions<T>) => {
      if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
        throw new Error('Ethereum RPC Server errors must provide single object argument.');
      }
      const { code } = opts;
      if (!Number.isInteger(code) || code > -32005 || code < -32099) {
        throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');
      }
      return getEthJsonRpcError(code, opts);
    },
    invalidInput: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.invalidInput, arg),
    resourceNotFound: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.resourceNotFound, arg),
    resourceUnavailable: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.resourceUnavailable, arg),
    transactionRejected: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.transactionRejected, arg),
    methodNotSupported: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.methodNotSupported, arg),
    limitExceeded: <T extends Json>(arg?: EthErrorsArg<T>) =>
      getEthJsonRpcError(errorCodes.rpc.limitExceeded, arg),
  },

  provider: {
    userRejectedRequest: <T extends Json>(arg?: EthErrorsArg<T>) => {
      return getEthProviderError(errorCodes.provider.userRejectedRequest, arg);
    },
    unauthorized: <T extends Json>(arg?: EthErrorsArg<T>) => {
      return getEthProviderError(errorCodes.provider.unauthorized, arg);
    },
    unsupportedMethod: <T extends Json>(arg?: EthErrorsArg<T>) => {
      return getEthProviderError(errorCodes.provider.unsupportedMethod, arg);
    },
    disconnected: <T extends Json>(arg?: EthErrorsArg<T>) => {
      return getEthProviderError(errorCodes.provider.disconnected, arg);
    },
    chainDisconnected: <T extends Json>(arg?: EthErrorsArg<T>) => {
      return getEthProviderError(errorCodes.provider.chainDisconnected, arg);
    },
    custom: <T extends Json>(opts: CustomErrorArg<T>) => {
      if (!opts || typeof opts !== 'object' || Array.isArray(opts)) {
        throw new Error('Ethereum Provider custom errors must provide single object argument.');
      }
      const { code, message, data } = opts;
      if (!message || typeof message !== 'string')
        throw new Error('"message" must be a nonempty string');
      return new EthereumProviderError(code, message, data);
    },
  },
};

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
