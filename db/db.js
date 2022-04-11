const mongoose = require('mongoose');

// define mongoose promise library
mongoose.Promise = global.Promise;

// connect to db
mongoose.connect(process.env.MONGODB_URI, {
  auth: { authSource: 'admin' },
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASS,
});

module.exports = {
  mongoose,
};
