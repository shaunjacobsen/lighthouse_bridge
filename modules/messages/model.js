const mongoose = require('mongoose');
const { deviceModel } = require('./../instances/deviceModel');

let messageRecipient = new mongoose.Schema({
  device: deviceModel,
  created: { type: Number, default: new Date().getTime() },
  delivery: {
    complete: { type: Boolean, default: false },
    at: { type: Number },
  },
  dismissal: {
    complete: { type: Boolean, default: false },
    at: { type: Number },
    by: { type: Number },
  },
});

let message = new mongoose.Schema({
  created: { type: Number, default: new Date().getTime() },
  originator: { type: String, default: 'HTTP' },
  recipients: [messageRecipient],
  type: { type: String, default: 'alert' },
  title: String,
  shortTitle: String,
  body: String,
  behavior: String,
  attributes: {},
  expires: { type: Number, default: new Date().getTime() + 3600000 },
});

let Message = mongoose.model('Message', message);
let MessageRecipient = mongoose.model('MessageRecipient', messageRecipient);

module.exports = { Message, MessageRecipient };