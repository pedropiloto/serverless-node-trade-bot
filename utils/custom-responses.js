module.exports.successRequestResponse = (data) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(
      data,
      null,
      2,
    ),
  };
  console.log('success request:', response);
  return response;
};

module.exports.badRequestResponse = (message) => {
  const response = {
    statusCode: 400,
    body: JSON.stringify(
      {
        message,
      },
      null,
      2,
    ),
  };
  console.log('bad request:', response);
  return response;
};

module.exports.internalErrorResponse = (message) => {
  const response = {
    statusCode: 500,
    body: JSON.stringify(
      {
        message,
      },
      null,
      2,
    ),
  };
  console.log('internal error:', response);
  return response;
};
