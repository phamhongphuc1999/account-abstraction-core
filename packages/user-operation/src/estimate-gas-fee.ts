import BigNumber from 'bignumber.js';
import { GasPriceOracle } from 'gas-price-oracle';
import { EstimatedGasPrice, GasOracleOptions, GasPrice } from 'gas-price-oracle/lib/services';
import { toHex } from './utils.js';

export class EstimateGasFee {
  private oracle: GasPriceOracle;

  constructor(options?: GasOracleOptions) {
    this.oracle = new GasPriceOracle(options);
  }

  async estimateEIP1559Fee(fallbackGasPrices?: EstimatedGasPrice) {
    const rawResult = await this.oracle.eip1559.estimateFees(fallbackGasPrices);
    return {
      raw: rawResult,
      gwei: {
        baseFee: toHex(BigNumber(rawResult.baseFee ?? 0).multipliedBy(1000000000)),
        maxFeePerGas: toHex(BigNumber(rawResult.maxFeePerGas ?? 0).multipliedBy(1000000000)),
        maxPriorityFeePerGas: toHex(
          BigNumber(rawResult.maxPriorityFeePerGas ?? 0).multipliedBy(1000000000),
        ),
      },
    };
  }

  async estimateLegacyFee(fallbackGasPrices?: GasPrice) {
    return await this.oracle.legacy.gasPrices(fallbackGasPrices);
  }
}
