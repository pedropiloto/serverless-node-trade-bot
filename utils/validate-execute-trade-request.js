module.exports.validateExecuteTradeRequest = (request) => (request.metric !== 'RSI' || (request.action !== 'BUY' || request.action !== 'SELL'));
