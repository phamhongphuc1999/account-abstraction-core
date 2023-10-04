import { Json } from '../query.js';

export type SerializedEthereumRpcError = {
  code: number;
  message: string;
  data?: Json;
  stack?: string;
};

export class EthereumRpcError<T extends Json> extends Error {
  code: number;
  data?: T;

  constructor(code: number, message: string, data?: T) {
    if (!Number.isInteger(code)) throw new Error('"code" must be an integer.');
    if (!message || typeof message !== 'string')
      throw new Error('"message" must be a nonempty string.');
    super(message);
    this.code = code;
    if (data !== undefined) this.data = data;
  }

  serialize(): SerializedEthereumRpcError {
    const serialized: SerializedEthereumRpcError = {
      code: this.code,
      message: this.message,
    };
    if (this.data !== undefined) serialized.data = this.data;
    if (this.stack) serialized.stack = this.stack;
    return serialized;
  }

  toString() {
    return this.serialize();
  }
}

function isValidEthProviderCode(code: number): boolean {
  return Number.isInteger(code) && code >= 1000 && code <= 4999;
}

export class EthereumProviderError<T extends Json> extends EthereumRpcError<T> {
  constructor(code: number, message: string, data?: T) {
    if (!isValidEthProviderCode(code)) {
      throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');
    }
    super(code, message, data);
  }
}
