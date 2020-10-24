/* eslint-disable no-console */
const PlaceOrderInteractor = require('../interactors/place-order-interactor');
const LookupTradesInteractor = require('../interactors/lookup-trades-interactor');
const { validateExecuteTradeRequest } = require('../utils/validate-execute-trade-request');
const { convertSymbol } = require('../utils/convert-symbol');
const mongoose = require('../config/database');
const { UnknownActionError } = require('../errors');
const { successRequestResponse, badRequestResponse, internalErrorResponse } = require('../utils/custom-responses');

module.exports.all = async () => {
  mongoose.connection.on(
    'error',
    console.error.bind(console, 'MongoDB connection error:'),
  );
  const lookupTradesInteractor = new LookupTradesInteractor();

  try {
    const trades = await lookupTradesInteractor.call();
    return successRequestResponse(trades);
  } catch (e) {
    const response = internalErrorResponse(`internal error: ${e.stack}`);
    return response;
  }
};

module.exports.execute = async (event) => {
  mongoose.connection.on(
    'error',
    console.error.bind(console, 'MongoDB connection error:'),
  );

  console.log('request', event);

  const payload = JSON.parse(event.body);

  if (validateExecuteTradeRequest(payload) === false) return badRequestResponse('Invalid Arguments');

  const complexSymbol = convertSymbol(payload.symbol);

  if (!complexSymbol) return badRequestResponse('symbol not supported');

  console.log(`procceeding to place ${payload.action} order for ${payload.symbol}`);

  const placeOrderInteractor = new PlaceOrderInteractor();

  try {
    const success = await placeOrderInteractor.call(
      complexSymbol, payload.action, payload.platform, payload.metric_value,
    );
    console.log('success', success);
    return successRequestResponse(
      {
        success,
        message: `${payload.action} order for ${complexSymbol.symbol} ${success ? 'fullfilled' : 'not fullfilled'}`,
      },
    );
  } catch (e) {
    if (e instanceof UnknownActionError) {
      return badRequestResponse('symbol not supported');
    }
    return internalErrorResponse(e.stack);
  }
};
