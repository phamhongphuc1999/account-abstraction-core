/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Json,
  JsonRpcRequest,
  JsonRpcResponse,
  RequestRpcMiddleware,
  ResponseRpcMiddleware,
  checkForHttpErrors,
  ethErrors,
  normalizeUrlFromParsed,
} from '@peter-present/user-operation-type';
import JsonRpcMiddleware from './json-rpc-middleware.js';

const fetch = global.fetch;

const RETRIABLE_ERRORS: string[] = [
  // ignore server overload errors
  'Gateway timeout',
  'ETIMEDOUT',
  // ignore server sent html error pages
  // or truncated json responses
  'failed to parse response body',
  // ignore errors where http req failed to establish
  'Failed to fetch',
];

interface Request {
  method: string;
  headers: Record<string, string>;
  body: string;
}

export type BlockData = string | string[];
export type Block = Record<string, BlockData>;

export default class JsonRpcEngine {
  private rpcUrl: URL;
  private requestMiddleware: Array<RequestRpcMiddleware<unknown>>;
  private responseMiddleware: Array<ResponseRpcMiddleware<unknown, unknown>>;

  constructor(rpcUrl: string) {
    try {
      this.rpcUrl = new URL(rpcUrl);
    } catch (_) {
      throw new Error('Invalid RPC');
    }
    this.requestMiddleware = [];
    this.responseMiddleware = [];
  }

  addRequestMiddleware<Params>(middleware: RequestRpcMiddleware<Params>) {
    this.requestMiddleware.push(middleware as RequestRpcMiddleware<unknown>);
  }

  addResponseMiddleware<Params, Result>(middleware: ResponseRpcMiddleware<Params, Result>) {
    this.responseMiddleware.push(middleware as ResponseRpcMiddleware<unknown, unknown>);
  }

  async handle<Params, Result = unknown>(
    request: JsonRpcRequest<Params>,
    callback?: (response: JsonRpcResponse<Result>) => void,
  ) {
    const { request: finalRequest, error } = JsonRpcMiddleware.runRequestMiddlewareList(
      request,
      this.requestMiddleware,
    );
    if (error) throw new Error(`RPC engine fail: ${error.message}`);
    const _result = await this._fetch(finalRequest);
    if (_result) {
      const { response: finalResponse } = JsonRpcMiddleware.runResponseMiddlewareList(
        request,
        _result,
        this.responseMiddleware,
      );
      if (callback) callback(finalResponse as JsonRpcResponse<Result>);
      const finalResult = (finalResponse as JsonRpcResponse<Result>).result;
      if (finalResult) return finalResult;
    }
    return null;
  }

  private async _fetch<Params>(request: JsonRpcRequest<Params>) {
    const { fetchUrl, fetchParams } = this._createFetchConfig(request);
    try {
      const fetchRes: Response = await fetch(fetchUrl, fetchParams);
      checkForHttpErrors(fetchRes);
      const rawBody: string = await fetchRes.text();
      let fetchBody: JsonRpcResponse;
      try {
        fetchBody = JSON.parse(rawBody);
      } catch (_) {
        throw new Error(`RPC - failed to parse response body: "${rawBody}"`);
      }
      if (fetchRes.status !== 200)
        throw ethErrors.rpc.internal({
          message: `Non-200 status code: '${fetchRes.status}'`,
          data: fetchBody as Json,
        });
      if (fetchBody.error) throw ethErrors.rpc.internal({ data: fetchBody.error as Json });
      return fetchBody;
    } catch (err: any) {
      const isRetriable: boolean = RETRIABLE_ERRORS.some((phrase) =>
        JSON.stringify(err).includes(phrase),
      );
      if (!isRetriable) throw err;
    }
  }

  private _createFetchConfig<Params>(request: JsonRpcRequest<Params>) {
    const fetchUrl: string = normalizeUrlFromParsed(this.rpcUrl);
    const payload: Partial<JsonRpcRequest<Params>> = {
      id: request.id,
      jsonrpc: request.jsonrpc,
      method: request.method,
      params: request.params,
    };
    const serializedPayload: string = JSON.stringify(payload);
    const fetchParams: Request = {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: serializedPayload,
    };
    if (this.rpcUrl.username && this.rpcUrl.pathname) {
      const authString = `${this.rpcUrl.username}:${this.rpcUrl.password}`;
      const encodedAuth = btoa(authString);
      fetchParams.headers.Authorization = `Basic ${encodedAuth}`;
    }
    return { fetchUrl, fetchParams };
  }
}
