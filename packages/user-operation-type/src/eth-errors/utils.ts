/* eslint-disable @typescript-eslint/no-explicit-any */
import { errorCodes, errorValues } from '../error.js';
import { Json } from '../query.js';
import { hasProperty, isPlainObject } from '../utils.js';
import { EthereumRpcError, SerializedEthereumRpcError } from './classes.js';
import { ethErrors } from './errors.js';

const FALLBACK_ERROR_CODE = errorCodes.rpc.internal;
const FALLBACK_MESSAGE = 'Unspecified error message. This is a bug, please report it.';
const FALLBACK_ERROR: SerializedEthereumRpcError = {
  code: FALLBACK_ERROR_CODE,
  message: getMessageFromCode(FALLBACK_ERROR_CODE),
};

export const JSON_RPC_SERVER_ERROR_MESSAGE = 'Unspecified server error.';

type ErrorValueKey = keyof typeof errorValues;

function isJsonRpcServerError(code: number): boolean {
  return code >= -32099 && code <= -32000;
}

function assignOriginalError(error: unknown): unknown {
  if (error && typeof error === 'object' && !Array.isArray(error)) return Object.assign({}, error);
  return error;
}

export function getMessageFromCode(
  code: number,
  fallbackMessage: string = FALLBACK_MESSAGE,
): string {
  if (Number.isInteger(code)) {
    const codeString = code.toString();
    if (hasProperty(errorValues, codeString))
      return errorValues[codeString as ErrorValueKey].message;
    if (isJsonRpcServerError(code)) return JSON_RPC_SERVER_ERROR_MESSAGE;
  }
  return fallbackMessage;
}

export function isValidCode(code: number): boolean {
  if (!Number.isInteger(code)) return false;
  const codeString = code.toString();
  if (errorValues[codeString as ErrorValueKey]) return true;
  if (isJsonRpcServerError(code)) return true;
  return false;
}

export function serializeError(
  error: unknown,
  { fallbackError = FALLBACK_ERROR, shouldIncludeStack = false } = {},
): SerializedEthereumRpcError {
  if (
    !fallbackError ||
    !Number.isInteger(fallbackError.code) ||
    typeof fallbackError.message !== 'string'
  ) {
    throw new Error('Must provide fallback error with integer number code and string message.');
  }

  if (error instanceof EthereumRpcError) return error.serialize();
  const serialized: Partial<SerializedEthereumRpcError> = {};

  if (
    error &&
    isPlainObject(error) &&
    hasProperty(error, 'code') &&
    isValidCode((error as SerializedEthereumRpcError).code)
  ) {
    const _error = error as Partial<SerializedEthereumRpcError>;
    serialized.code = _error.code as number;

    if (_error.message && typeof _error.message === 'string') {
      serialized.message = _error.message;
      if (hasProperty(_error, 'data')) serialized.data = _error.data ?? null;
    } else {
      serialized.message = getMessageFromCode((serialized as SerializedEthereumRpcError).code);
      serialized.data = { originalError: assignOriginalError(error) } as Json;
    }
  } else {
    serialized.code = fallbackError.code;
    const message = (error as any)?.message;
    serialized.message = message && typeof message === 'string' ? message : fallbackError.message;
    serialized.data = { originalError: assignOriginalError(error) } as Json;
  }

  const stack = (error as any)?.stack;
  if (shouldIncludeStack && error && stack && typeof stack === 'string') {
    serialized.stack = stack;
  }
  return serialized as SerializedEthereumRpcError;
}

function createRateLimitError(): EthereumRpcError<Json> {
  return ethErrors.rpc.internal({ message: 'Request is being rate limited.' });
}

function createTimeoutError(): EthereumRpcError<Json> {
  let msg = 'Gateway timeout. The request took too long to process. ';
  msg += 'This can happen when querying logs over too wide a block range.';
  return ethErrors.rpc.internal({ message: msg });
}

export function checkForHttpErrors(fetchRes: Response): void {
  switch (fetchRes.status) {
    case 405:
      throw ethErrors.rpc.methodNotFound();
    case 418:
      throw createRateLimitError();
    case 503:
    case 504:
      throw createTimeoutError();
    default:
      break;
  }
}
