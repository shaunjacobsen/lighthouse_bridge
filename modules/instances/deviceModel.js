const mongoose = require('mongoose');

let deviceModel = new mongoose.Schema({
  productName: String,
  productVersion: String,
  productIdentifier: String,
  productSerial: String,
  capabilities: [String],
  type: String,
  parameters: {},
  archetypes: [String],
  eventListeners: {},
  friendlyName: { type: String, trim: true },
  friendlyLocation: { type: String, trim: true },
  isActive: {type: Boolean, default: true },
  created: { type: Number, default: new Date().getTime() },
});

let Device = mongoose.model('Device', deviceModel);

module.exports = {
  Device,
  deviceModel,
};
