module.exports.convertSymbol = (symbol) => {
  switch (symbol) {
    case 'BTCEUR':
      return { symbol: 'BTC-EUR', base_currency: 'EUR', target_currency: 'BTC' };
    case 'XLMEUR':
      return { symbol: 'XLM-EUR', base_currency: 'EUR', target_currency: 'XLM' };
    default:
      return undefined;
  }
};
