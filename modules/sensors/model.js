const mongoose = require('mongoose');

let sensorData = new mongoose.Schema({
  created: { type: Number, default: new Date().getTime() },
  deviceId: String,
  reportType: String,
  data: { type: Object, required: true },
  granularity: Number,
});

let SensorData = mongoose.model('SensorData', sensorData);

module.exports = { SensorData };