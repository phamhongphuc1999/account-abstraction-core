export type Json = null | boolean | number | string | Json[] | { [prop: string]: Json };
export type RealJson = { [key: string]: Json };

export type PlainObject = Record<number | string | symbol, unknown>;
export type RuntimeObject = Record<number | string | symbol, unknown>;

export type JsonRpcId = string | number | null;
export type JsonRpcVersion2 = '2.0';
export declare type JsonRpcError = {
  code: number;
  message: string;
  data?: unknown;
  stack?: string;
};

export type JsonRpcRequest<Params> = {
  id: JsonRpcId;
  jsonrpc: JsonRpcVersion2;
  method: string;
  params?: Params;
};

export type JsonRpcResponse<Result = unknown> = {
  id: JsonRpcId;
  jsonrpc: JsonRpcVersion2;
  result?: Result;
  error?: JsonRpcError;
};

export type RequestRpcMiddlewareReturn<Params> = {
  request: JsonRpcRequest<Params>;
  error?: JsonRpcError;
};

export type RequestRpcMiddleware<Params> = (
  request: JsonRpcRequest<Params>,
) => RequestRpcMiddlewareReturn<Params>;

export type ResponseRpcMiddlewareReturn<Params, Result> = {
  request: JsonRpcRequest<Params>;
  response: JsonRpcResponse<Result>;
};

export type ResponseRpcMiddleware<Params, Result> = (
  request: JsonRpcRequest<Params>,
  response: JsonRpcResponse<Result>,
) => ResponseRpcMiddlewareReturn<Params, Result>;
