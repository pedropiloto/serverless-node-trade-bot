/* eslint-disable no-console */
const GenerateSummaryInteractor = require('../interactors/generate-summary-interactor');
const { successRequestResponse, internalErrorResponse } = require('../utils/custom-responses');
const mongoose = require('../config/database');

module.exports.generate = async () => {
  mongoose.connection.on(
    'error',
    console.error.bind(console, 'MongoDB connection error:'),
  );

  const generateSummaryInteractor = new GenerateSummaryInteractor();

  try {
    const summary = await generateSummaryInteractor.call();
    console.log(summary);
    return successRequestResponse(
      {
        summary,
      },
    );
  } catch (e) {
    return internalErrorResponse(e.stack);
  }
};
