const mongoose = require('mongoose');
const { LighthouseInstance } = require('./instanceModel.js');

let metaModel = new mongoose.Schema({
  instance: LighthouseInstance
});

let Meta = mongoose.model('Meta', metaModel);

module.exports = {
  Meta,
  metaModel,
};
