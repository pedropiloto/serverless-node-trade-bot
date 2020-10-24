module.exports.convertSymbol = (symbol) => {
  switch (symbol) {
    case 'BTCEUR':
      return { symbol: 'BTC-EUR', base_currency: 'EUR', target_currency: 'BTC' };
    case 'XLMEUR':
      return { symbol: 'XLM-EUR', base_currency: 'EUR', target_currency: 'XLM' };
    case 'ETHEUR':
      return { symbol: 'ETH-EUR', base_currency: 'EUR', target_currency: 'ETH' };
    case 'XRPEUR':
      return { symbol: 'XRP-EUR', base_currency: 'EUR', target_currency: 'XRP' };
    default:
      return undefined;
  }
};
