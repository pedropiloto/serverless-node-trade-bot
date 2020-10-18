const fs = require('fs');

const jsonConfig = JSON.parse(fs.readFileSync('env/env.json'));

module.exports.fetchUseSandbox = () => (jsonConfig ? jsonConfig.use_sandbox : undefined);

module.exports.fetchCoinbaseApiKey = () => (jsonConfig ? jsonConfig.coinbase_api_key : undefined);

module.exports.fetchCoinbaseApiSecret = () => (
  jsonConfig
    ? jsonConfig.coinbase_api_secret
    : undefined
);

module.exports.fetchCoinbaseApiPassphrase = () => (
  jsonConfig
    ? jsonConfig.coinbase_api_passphrase
    : undefined
);

module.exports.fetchMongodbUrl = () => (jsonConfig ? jsonConfig.mongodb_url : undefined);
