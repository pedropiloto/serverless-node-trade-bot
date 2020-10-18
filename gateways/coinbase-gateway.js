/* eslint-disable no-console */
const {
  CoinbasePro, OrderSide, OrderType, CandleGranularity, FeeUtil,
} = require('coinbase-pro-node');
const Big = require('big.js');

class CoinbaseGateway {
  constructor() {
    const useSandbox = process.env.use_sandbox === 'true';
    console.log(`creating client to ${useSandbox ? 'sandbox' : 'production'} account`);

    this.client = new CoinbasePro(
      {
        apiKey: process.env.coinbase_api_key,
        apiSecret: process.env.coinbase_api_secret,
        passphrase: process.env.coinbase_api_passphrase,
        useSandbox,
      },
    );
  }

  getAccounts() {
    return this.client.rest.account.listAccounts();
  }

  placeBuyOrder(productId, funds) {
    return this.client.rest.order.placeOrder({
      product_id: productId,
      side: OrderSide.BUY,
      funds,
      type: OrderType.MARKET,
    });
  }

  placeSellOrder(productId, size) {
    return this.client.rest.order.placeOrder({
      product_id: productId,
      side: OrderSide.SELL,
      size,
      type: OrderType.MARKET,
    });
  }

  async getFillsByOrderId(orderId) {
    const fills = [];
    let fetchResult = await this.client.rest.fill.getFillsByOrderId(orderId);
    fills.push(...fetchResult.data);
    console.log('fills', fetchResult);
    while (fetchResult.pagination.after) {
      // eslint-disable-next-line no-await-in-loop
      fetchResult = await this.client.rest.fill.getFillsByOrderId(orderId, {
        after: fetchResult.pagination.after,
      });
      console.log('CENAS', fetchResult);
      if (fetchResult.data > 0) {
        console.log('wow!! more than 100 fills, maybe it would be nice to check the order_id:', orderId);
        fills.push(...fetchResult.data);
      }
    }
    return fills;
  }

  getCandles(symbol) {
    return this.client.rest.product.getCandles(symbol, {
      granularity: CandleGranularity.FIFTEEN_MINUTES,
    });
  }

  getCurrentFees() {
    return this.client.rest.fee.getCurrentFees();
  }

  async getEstimatePrice(complexSymbol, action, funds, amount) {
    const candles = await this.getCandles(complexSymbol.symbol);
    const lastClosingPrice = candles[candles.length - 1].close;

    console.log('last closing price', lastClosingPrice);

    const feeTier = await this.getCurrentFees();

    let productAmount;
    const lastClosingPriceBig = new Big(lastClosingPrice);
    if (action === 'BUY') {
      const fundsBig = new Big(funds);
      // calculate based on the funds
      productAmount = fundsBig.div(lastClosingPrice);
    } else {
      // the amount available in the portfolio
      productAmount = amount;
    }
    console.log('productAmount', productAmount.toString());
    const estimatedFee = FeeUtil.estimateFee(productAmount, lastClosingPrice, action === 'BUY' ? OrderSide.BUY : OrderSide.SELL, OrderType.MARKET, feeTier, complexSymbol.target_currency);

    return {
      amount: productAmount,
      lastClosingPrice: lastClosingPriceBig,
      effectiveTotal: estimatedFee.effectiveTotal,
    };
  }
}

module.exports = CoinbaseGateway;
