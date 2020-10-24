/* eslint-disable no-console */
const Big = require('big.js');
const CoinbaseGateway = require('../gateways/coinbase-gateway');
const { TradeModel, STARTED, COMPLETED } = require('../models/trade');
const { UnknownActionError } = require('../errors');
const EstimatePriceInteractor = require('./estimate-price');

const MAX_FUNDS_AMOUNT = 100;

class PlaceOrderInteractor {
  constructor() {
    this.coinbaseGateway = new CoinbaseGateway();
    this.estimatePriceInteractor = new EstimatePriceInteractor();
  }

  async call(complexSymbol, action, platform, metricValue) {
    if (action === 'BUY') {
      return this.buy(complexSymbol, action, platform, metricValue);
    } if (action === 'SELL') {
      return this.sell(complexSymbol, action, metricValue);
    }
    console.log('unknown action:', action);
    throw UnknownActionError('unknown action:', action);
  }

  async buy(complexSymbol, action, platform, metricValue) {
    let canBuy = false;

    try {
      const openTrades = await TradeModel.find({ symbol: complexSymbol.symbol, status: STARTED });
      canBuy = !openTrades.length > 0;
      console.log('openTrades', openTrades, 'canBuy', canBuy);
    } catch (e) {
      console.error('could not lookup in mongodb on buying', e.stack);
    }
    if (canBuy) {
      console.log(`placing buy order for ${complexSymbol.symbol} symbol ${Number(MAX_FUNDS_AMOUNT)} funds`);
      const order = await this.coinbaseGateway
        .placeBuyOrder(complexSymbol.symbol, MAX_FUNDS_AMOUNT);
      console.log('buy order completed', order);
      const buyEstimate = await this.estimatePriceInteractor
        .call(complexSymbol, action, MAX_FUNDS_AMOUNT, undefined);
      try {
        const createdTrade = await TradeModel.create({
          symbol: complexSymbol.symbol,
          buy_order_id: order.id,
          started_at: Date.now(),
          buy_last_closing_price: buyEstimate.lastClosingPrice.toString(),
          buy_estimated_amount: buyEstimate.amount.toString(),
          buy_estimated_effective_price: buyEstimate.effectiveTotal.toString(),
          buy_metric_value: metricValue,
          platform,
          status: STARTED,
        });
        console.log('created trade', createdTrade);
      } catch (e) {
        console.error(`could not save order ${order.id} in mongodb: ${e.stack}`);
      }
      return true;
    }
    console.log('not placing order for precaution because the last order was probably not sold yet');
    return false;
  }

  async sell(complexSymbol, action, metricValue) {
    const accounts = await this.coinbaseGateway.getAccounts();
    const account = accounts.find((item) => item.currency === complexSymbol.target_currency);
    console.log('checking balance on account:', account);
    let canSell = false;
    let openTrade; let
      sellEstimate;

    try {
      openTrade = await TradeModel.findOne({ symbol: complexSymbol.symbol, status: STARTED });
      if (!openTrade) {
        console.log('sell order will not be placed since there is no ongoing trade');
        return false;
      }

      sellEstimate = await this.estimatePriceInteractor
        .call(complexSymbol, action, undefined, account.available);
      console.log(openTrade.buy_estimated_effective_price, 'vs', sellEstimate.effectiveTotal.toString());
      const buyEstimatedEffectivePriceBig = new Big(openTrade.buy_estimated_effective_price);
      if (sellEstimate.effectiveTotal.cmp(buyEstimatedEffectivePriceBig) >= 1) {
        console.log('probably closing trading with profit');
        canSell = true;
      } else {
        console.log('not selling to protect from losing money');
        const rejectedOrders = openTrade.rejected_sell_orders;
        rejectedOrders.push({
          date: Date.now(),
          market_value: sellEstimate.lastClosingPrice.toString(),
          effective_total: sellEstimate.effectiveTotal.toString(),
          metric_value: metricValue,
        });
        await TradeModel.findOneAndUpdate(
          // eslint-disable-next-line no-underscore-dangle
          { _id: openTrade._id },
          { rejected_sell_orders: rejectedOrders },
        )
          .then(() => console.log('update rejected orders successfully'))
          .catch((error) => console.log('eeror updating rejected orders:', error.stack));
        return false;
      }
      console.log('openTrade', openTrade, 'canSell', canSell);
    } catch (e) {
      console.error('could not lookup in mongodb on selling.', e.stack);
    }

    if (canSell) {
      console.log(`placing sell order for ${Number(account.available)} size`);
      const order = await this.coinbaseGateway
        .placeSellOrder(complexSymbol.symbol, account.available);
      console.log('sell order completed', order);
      try {
        const updatedTrade = await TradeModel.findOneAndUpdate({
          symbol: complexSymbol.symbol,
          status: STARTED,
        }, {
          sell_order_id: order.id,
          sell_last_closing_price: sellEstimate.lastClosingPrice.toString(),
          sell_estimated_effective_price: sellEstimate.effectiveTotal.toString(),
          sell_metric_value: metricValue,
          finished_at: Date.now(),
          status: COMPLETED,
        });
        console.log('updatedTrade:', updatedTrade);
      } catch (e) {
        console.error('could not update trade for sell order', order, e.stack);
      }
      return true;
    }
    console.log('order was not placed');
    return false;
  }
}

module.exports = PlaceOrderInteractor;
