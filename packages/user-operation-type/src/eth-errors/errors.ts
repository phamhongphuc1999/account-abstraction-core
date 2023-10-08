import { Json } from '../query.js';
import { EthereumProviderError, EthereumRpcError } from './classes.js';
import { errorCodes } from './errors-constant.js';
import { getMessageFromCode } from './utils.js';

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
