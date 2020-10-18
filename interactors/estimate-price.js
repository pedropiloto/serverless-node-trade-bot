/* eslint-disable no-console */
const CoinbaseGateway = require('../gateways/coinbase-gateway');

class EstimatePriceInteractor {
  constructor() {
    this.coinbaseGateway = new CoinbaseGateway();
  }

  async call(complexSymbol, action, funds, amount) {
    const estimatedFee = await this.coinbaseGateway
      .getEstimatePrice(complexSymbol, action, funds, amount);
    console.log('ESTIMATE', estimatedFee.effectiveTotal.toNumber());
    return estimatedFee;
  }
}

module.exports = EstimatePriceInteractor;
