import {
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcResponse,
  RequestRpcMiddleware,
  RequestRpcMiddlewareReturn,
  ResponseRpcMiddleware,
  ResponseRpcMiddlewareReturn,
} from '@peter-present/user-operation-type';

export class JsonRpcMiddleware {
  static runRequestMiddleware<Params>(
    request: JsonRpcRequest<Params>,
    middleware: RequestRpcMiddleware<Params>,
  ) {
    return middleware(request);
  }

  static runRequestMiddlewareList<Params>(
    request: JsonRpcRequest<Params>,
    middlewareList: Array<RequestRpcMiddleware<Params>>,
  ) {
    let finalRequest = request;
    let finalError: JsonRpcError | undefined = undefined;
    for (const middleware of middlewareList) {
      const { request: _request, error } = middleware(finalRequest);
      finalRequest = _request;
      if (error) {
        finalError = error;
        break;
      }
    }
    return { request: finalRequest, error: finalError } as RequestRpcMiddlewareReturn<Params>;
  }

  static runResponseMiddleware<Params, Result>(
    request: JsonRpcRequest<Params>,
    response: JsonRpcResponse<Result>,
    middleware: ResponseRpcMiddleware<Params, Result>,
  ) {
    return middleware(request, response);
  }

  static runResponseMiddlewareList<Params, Result>(
    request: JsonRpcRequest<Params>,
    response: JsonRpcResponse<Result>,
    middlewareList: Array<ResponseRpcMiddleware<Params, Result>>,
  ) {
    let finalResponse = response;
    for (const middleware of middlewareList) {
      const { request: _request, response: _response } = middleware(request, finalResponse);
      finalResponse = _response;
      if (finalResponse.error) break;
    }
    return { request, response: finalResponse } as ResponseRpcMiddlewareReturn<Params, Result>;
  }

  static mergeRequestMiddleware<Params>(
    middlewareList: Array<RequestRpcMiddleware<Params>>,
  ): RequestRpcMiddleware<Params> {
    return (request: JsonRpcRequest<Params>) => {
      return JsonRpcMiddleware.runRequestMiddlewareList(request, middlewareList);
    };
  }

  static mergeResponseMiddleware<Params, Result>(
    middlewareList: Array<ResponseRpcMiddleware<Params, Result>>,
  ): ResponseRpcMiddleware<Params, Result> {
    return (request: JsonRpcRequest<Params>, response: JsonRpcResponse<Result>) => {
      return JsonRpcMiddleware.runResponseMiddlewareList(request, response, middlewareList);
    };
  }
}
