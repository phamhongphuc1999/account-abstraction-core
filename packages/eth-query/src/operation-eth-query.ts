/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CustomRPCMethods,
  EstimatedUserOperationGas,
  OptionType,
  UserOperationByHashResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationStruct,
} from '@peter-present/user-operation-type';
import { BaseEthQuery } from './base-eth-query.js';

export class OperationEthQuery extends BaseEthQuery {
  constructor(rpcUrl: string, options?: OptionType) {
    super(rpcUrl, options);
  }

  async validateUserOp(userOperation: UserOperationStruct, entryPoint: string) {
    const _data = await this._sendAsync<any, boolean>(
      this._createPayload(CustomRPCMethods.eth_validateUserOperation, [userOperation, entryPoint]),
    );
    return _data;
  }

  async sendUserOperation(userOperation: UserOperationStruct, entryPoint: string) {
    const _data = await this._sendAsync<any, string>(
      this._createPayload(UserOperationRequest.sendUserOperation, [userOperation, entryPoint]),
    );
    return _data;
  }

  async estimateUserOperationGas(userOperation: UserOperationStruct, entryPoint: string) {
    const _estimateGas = await this._sendAsync<any, EstimatedUserOperationGas>(
      this._createPayload(UserOperationRequest.estimateUserOperationGas, [
        userOperation,
        entryPoint,
      ]),
    );
    return _estimateGas;
  }

  async getUserOperationByHash(hash: string) {
    const response = await this._sendAsync<any, UserOperationByHashResponse>(
      this._createPayload(UserOperationRequest.getUserOperationByHash, [hash]),
    );
    return response;
  }

  async getUserOperationReceipt(hash: string) {
    const receipt = await this._sendAsync<any, UserOperationReceipt>(
      this._createPayload(UserOperationRequest.getUserOperationReceipt, [hash]),
    );
    return receipt;
  }

  async supportedEntryPoints() {
    const _supportedEntryPoints = await this._sendAsync<any, Array<string>>(
      this._createPayload(UserOperationRequest.supportedEntryPoints, []),
    );
    return _supportedEntryPoints;
  }

  async chainId() {
    const _chainId = await this._sendAsync<any, string>(
      this._createPayload(UserOperationRequest.chainId, []),
    );
    return _chainId;
  }

  async debugBundlerClearState() {
    const result = await this._sendAsync<any, string>(
      this._createPayload(UserOperationRequest.debugBundlerClearState, []),
    );
    return result;
  }

  async debugBundlerDumpMempool() {
    const result = await this._sendAsync<any, Array<UserOperationStruct>>(
      this._createPayload(UserOperationRequest.debugBundlerDumpMempool, []),
    );
    return result;
  }

  async debugBundlerSendBundleNow() {
    const result = await this._sendAsync<any, string>(
      this._createPayload(UserOperationRequest.debugBundlerSendBundleNow, []),
    );
    return result;
  }

  async debugBundlerSetBundlingMode(mode: 'auto' | 'manual') {
    const result = await this._sendAsync<any, string>(
      this._createPayload(UserOperationRequest.debugBundlerSetBundlingMode, [mode]),
    );
    return result;
  }

  async debugBundlerSetReputation() {
    //
  }

  async debugBundlerDumpReputation() {
    //
  }
}
