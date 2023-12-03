import { ethers } from 'ethers';
import { EstimateGasFee } from './estimate-gas-fee.js';
import { EstimateOperationGas } from './estimate-operation-gas.js';

export class UserOperationEth {
  provider: ethers.JsonRpcProvider;
  chainId: number;

  estimateGas: EstimateOperationGas;
  estimateGasFee: EstimateGasFee;

  constructor(rpcUrl: string, chainId: string | number) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.estimateGas = new EstimateOperationGas(rpcUrl);
    if (typeof chainId == 'number') {
      this.chainId = chainId;
      this.estimateGasFee = new EstimateGasFee({ chainId, defaultRpc: rpcUrl });
    } else {
      const numChainId = parseInt(chainId, 16);
      this.chainId = numChainId;
      this.estimateGasFee = new EstimateGasFee({ chainId: numChainId, defaultRpc: rpcUrl });
    }
  }
}
