const mongoose = require('mongoose');

let LighthouseInstance = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  users: [{ type: mongoose.Schema.Types.ObjectId }],
  configuration: {},
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
  created: { type: Number, default: new Date().getTime() },
});

module.exports = { LighthouseInstance };