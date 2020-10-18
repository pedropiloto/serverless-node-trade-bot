// Set up mongoose connection
console.log('in db config');
const mongoose = require('mongoose');

const mongoDB = process.env.mongodb_url;
mongoose.set('useFindAndModify', false);
mongoose.connect(mongoDB, {
  useNewUrlParser: true, useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;

module.exports = mongoose;
