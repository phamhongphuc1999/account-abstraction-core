/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  JsonRpcRequest,
  OptionType,
  RequestRpcMiddleware,
  ResponseRpcMiddleware,
} from '@peter-present/user-operation-type';
import JsonRpcEngine from './json-rpc-engine.js';

export class BaseEthQuery {
  public rpcUrl: string;
  protected engine: JsonRpcEngine;
  protected idCounter: number;
  protected max: number;

  constructor(rpcUrl: string, options?: OptionType) {
    this.rpcUrl = rpcUrl;
    try {
      this.engine = new JsonRpcEngine(rpcUrl);
    } catch (_) {
      throw new Error('Invalid RPC');
    }
    const _options = options || { max: undefined, start: undefined };
    this.max = _options.max || Number.MAX_SAFE_INTEGER;
    this.idCounter =
      _options.start !== undefined ? _options.start : Math.floor(Math.random() * this.max);
  }

  addRequestMiddleware<Params>(middleware: RequestRpcMiddleware<Params>) {
    this.engine.addRequestMiddleware(middleware);
  }

  addResponseMiddleware<Params, Result>(middleware: ResponseRpcMiddleware<Params, Result>) {
    this.engine.addResponseMiddleware(middleware);
  }

  protected _createPayload<Params>(method: string, params?: Params) {
    const _counter = this.idCounter % this.max;
    this.idCounter = _counter + 1;
    return {
      id: this.idCounter.toString(),
      jsonrpc: '2.0',
      method: method,
      params: params ? params : [],
    } as JsonRpcRequest<any>;
  }

  protected async _sendAsync<Params, Result = unknown>(data: JsonRpcRequest<Params>) {
    return await this.engine.handle<Params, Result>(data);
  }
}
