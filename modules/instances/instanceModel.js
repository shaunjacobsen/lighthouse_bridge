const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

LighthouseInstance.methods.generateAuthToken = function() {
  let instance = this;
  let access = 'auth';
  let token = jwt
    .sign({ _id: instance._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();

  instance.tokens = instance.tokens.concat({ access, token });
  return instance.save().then(() => {
    return token;
  });
};

LighthouseInstance.statics.findByToken = function(token) {
  let Instance = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return Instance.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

let Instance = mongoose.model('LighthouseInstance', LighthouseInstance);

module.exports = { LighthouseInstance, Instance };