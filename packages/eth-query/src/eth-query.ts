/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AccountProofType,
  BlockTag,
  EthBlock,
  EthRequest,
  EthTransaction,
  FeeHistoryResult,
  Filter,
  GasUsed,
  JsonRpcRequest,
  LogType,
  OptionType,
  RawTransaction,
  SyncingType,
  TransactionReceipt,
  getAddress,
} from '@peter-present/user-operation-type';
import { BaseEthQuery } from './base-eth-query.js';

export class EthQuery extends BaseEthQuery {
  constructor(rpcUrl: string, options?: OptionType) {
    super(rpcUrl, options);
  }

  async getBlockByHash(blockHash: string, hydratedTransaction: boolean) {
    const data = this._createPayload(EthRequest.getBlockByHash, [blockHash, hydratedTransaction]);
    const _block = await this._sendAsync<any, EthBlock>(data);
    return _block;
  }

  async getBlockByNumber(block: string | BlockTag = 'latest', hydratedTransaction = false) {
    const data = this._createPayload(EthRequest.getBlockByNumber, [block, hydratedTransaction]);
    const _block = await this._sendAsync<any, EthBlock>(data);
    return _block;
  }

  async getBlockTransactionCountByHash(blockHash: string) {
    const data = this._createPayload(EthRequest.getBlockTransactionCountByHash, [blockHash]);
    const _transactionCount = await this._sendAsync<any, string>(data);
    return _transactionCount;
  }

  async getBlockTransactionCountByNumber(block: string | BlockTag = 'latest') {
    const data = this._createPayload(EthRequest.getBlockTransactionCountByNumber, [block]);
    const _transactionCount = await this._sendAsync<any, string>(data);
    return _transactionCount;
  }

  async getUncleCountByBlockHash(blockHash: string) {
    const data = this._createPayload(EthRequest.getUncleCountBlockHash, [blockHash]);
    const _uncleCount = await this._sendAsync<any, string>(data);
    return _uncleCount;
  }

  async getUncleCountByBlockNumber(block: string | BlockTag = 'latest') {
    const data = this._createPayload(EthRequest.getUncleCountBlockNumber, [block]);
    const _uncleCount = await this._sendAsync<any, string>(data);
    return _uncleCount;
  }

  async chainId() {
    const _chainId = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.chainId, []),
    );
    return _chainId;
  }

  async syncing() {
    const _syncing = await this._sendAsync<any, SyncingType>(
      this._createPayload(EthRequest.syncing, []),
    );
    return _syncing;
  }

  async coinbase() {
    const data = await this._sendAsync<any, string>(this._createPayload(EthRequest.coinbase, []));
    return data;
  }

  async accounts() {
    const data = await this._sendAsync<any, Array<string>>(
      this._createPayload(EthRequest.accounts, []),
    );
    return data;
  }

  async blockNumber() {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.blockNumber, []),
    );
    return data;
  }

  async call(rawTransaction: RawTransaction, block: string | BlockTag = 'latest') {
    const data = this._createPayload(EthRequest.call, [rawTransaction, block]);
    const result = await this._sendAsync<any, string>(data);
    return result;
  }

  async estimateGas(rawTransaction: RawTransaction, block: string | BlockTag = 'latest') {
    const data = this._createPayload(EthRequest.estimateGas, [rawTransaction, block]);
    const result = await this._sendAsync<any, string>(data);
    return result;
  }

  async createAccessList(rawTransaction: RawTransaction, block: string | BlockTag = 'latest') {
    const data = this._createPayload(EthRequest.createAccessList, [rawTransaction, block]);
    const result = await this._sendAsync<any, GasUsed>(data);
    return result;
  }

  async gasPrice() {
    const data = await this._sendAsync<any, string>(this._createPayload(EthRequest.gasPrice, []));
    return data;
  }

  async maxPriorityFeePerGas() {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.maxPriorityFeePerGas, []),
    );
    return data;
  }

  async feeHistory(
    blockCount: string,
    rewardPercentiles: Array<number>,
    newestBlock: string | BlockTag = 'latest',
  ) {
    const data = this._createPayload(EthRequest.feeHistory, [
      blockCount,
      newestBlock,
      rewardPercentiles,
    ]);
    const result = await this._sendAsync<any, FeeHistoryResult>(data);
    return result;
  }

  async newFilter(filter: Filter) {
    const data = this._createPayload(EthRequest.newFilter, [filter]);
    const result = await this._sendAsync<any, string>(data);
    return result;
  }

  async newBlockFilter() {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.newBlockFilter, []),
    );
    return data;
  }

  async newPendingTransactionFilter() {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.newPendingTransactionFilter, []),
    );
    return data;
  }

  async uninstallFilter(filterIdentifier: string) {
    const data = await this._sendAsync<any, boolean>(
      this._createPayload(EthRequest.uninstallFilter, [filterIdentifier]),
    );
    return data;
  }

  async getFilterChanges(filterIdentifier: string) {
    const data = await this._sendAsync<any, Array<string> | Array<LogType>>(
      this._createPayload(EthRequest.getFilterChanges, [filterIdentifier]),
    );
    return data;
  }

  async getFilterLogs(filterIdentifier: string) {
    const data = await this._sendAsync<any, Array<string> | Array<LogType>>(
      this._createPayload(EthRequest.getFilterLogs, [filterIdentifier]),
    );
    return data;
  }

  async getLogs(filter: Filter) {
    const data = await this._sendAsync<any, Array<string> | Array<LogType>>(
      this._createPayload(EthRequest.getLogs, [filter]),
    );
    return data;
  }

  async mining() {
    const data = await this._sendAsync<any, boolean>(this._createPayload(EthRequest.mining, []));
    return data;
  }

  async hashrate() {
    const data = await this._sendAsync<any, boolean>(this._createPayload(EthRequest.hashrate, []));
    return data;
  }

  async getWork() {
    const data = await this._sendAsync<any, Array<string>>(
      this._createPayload(EthRequest.getWork, []),
    );
    return data;
  }

  async submitWork(nonce: string, hash: string, digest: string) {
    const data = await this._sendAsync<any, boolean>(
      this._createPayload(EthRequest.submitWork, [nonce, hash, digest]),
    );
    return data;
  }

  async submitHashrate(hashrate: string, ID: string) {
    const data = await this._sendAsync<any, boolean>(
      this._createPayload(EthRequest.submitHashrate, [hashrate, ID]),
    );
    return data;
  }

  async sign(address: string, message: string) {
    const _address = getAddress(address);
    if (!_address) throw new Error('EthQuery-invalid address');
    const data = this._createPayload(EthRequest.sign, [_address, message]);
    const result = await this._sendAsync<any, string>(data);
    return result;
  }

  async signTransaction(rawTransaction: RawTransaction) {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.signTransaction, [rawTransaction]),
    );
    return data;
  }

  async getBalance(address: string, block: string | BlockTag = 'latest') {
    const _address = getAddress(address);
    if (!_address) throw new Error('EthQuery-invalid address');
    const data = this._createPayload(EthRequest.getBalance, [_address, block]);
    const balance = await this._sendAsync<any, string>(data);
    return balance;
  }

  async getStorageAt(address: string, storageSlot: string, block: string | BlockTag = 'latest') {
    const _address = getAddress(address);
    if (!_address) throw new Error('EthQuery-invalid address');
    const data = this._createPayload(EthRequest.getStorageAt, [_address, storageSlot, block]);
    const result = this._sendAsync<any, string>(data);
    return result;
  }

  async getTransactionCount(address: string, block: string | BlockTag = 'latest') {
    const _address = getAddress(address);
    if (!_address) throw new Error('EthQuery-invalid address');
    const data = this._createPayload(EthRequest.getTransactionCount, [_address, block]);
    const transactionCount = await this._sendAsync<any, string>(data);
    return transactionCount;
  }

  async getCode(address: string, block: string | BlockTag = 'latest') {
    const _address = getAddress(address);
    if (!_address) throw new Error('EthQuery-invalid address');
    const data = this._sendAsync<any, string>(
      this._createPayload(EthRequest.getCode, [_address, block]),
    );
    return data;
  }

  async getProof(address: string, storageKeys: Array<string>, block: string | BlockTag = 'latest') {
    const _address = getAddress(address);
    if (!_address) throw new Error('EthQuery-invalid address');
    const data = this._sendAsync<any, AccountProofType>(
      this._createPayload(EthRequest.getProof, [_address, storageKeys, block]),
    );
    return data;
  }

  async sendTransaction(rawTransaction: RawTransaction) {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.sendTransaction, [rawTransaction]),
    );
    return data;
  }

  async sendRawTransaction(encodedTransaction: string) {
    const data = await this._sendAsync<any, string>(
      this._createPayload(EthRequest.sendRawTransaction, [encodedTransaction]),
    );
    return data;
  }

  async getTransactionByHash(transactionHash: string) {
    const data = this._createPayload(EthRequest.getTransactionByHash, [transactionHash]);
    const result = await this._sendAsync<any, EthTransaction>(data);
    return result;
  }

  async getTransactionByBlockHashAndIndex(blockHash: string, transactionIndex: string) {
    const data = this._createPayload(EthRequest.getTransactionByBlockHashAndIndex, [
      blockHash,
      transactionIndex,
    ]);
    const result = await this._sendAsync<any, EthTransaction>(data);
    return result;
  }

  async getTransactionByBlockNumberAndIndex(blockHash: string, transactionIndex: string) {
    const data = this._createPayload(EthRequest.getTransactionByBlockNumberAndIndex, [
      blockHash,
      transactionIndex,
    ]);
    const result = await this._sendAsync<any, EthTransaction>(data);
    return result;
  }

  async getTransactionReceipt(transactionHash: string) {
    const data = await this._sendAsync<any, TransactionReceipt>(
      this._createPayload(EthRequest.getTransactionReceipt, [
        transactionHash,
      ]) as JsonRpcRequest<any>,
    );
    return data;
  }
}
