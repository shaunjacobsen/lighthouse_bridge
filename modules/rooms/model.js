// Incomplete

const mongoose = require('mongoose');

let room = new mongoose.Schema({
  created: { type: Number, default: new Date().getTime() },
  devices: [String],
});

let Room = mongoose.model('Room', room);

module.exports = { Room };