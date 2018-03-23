const { Device } = require('./../instances/deviceModel');

let lookupDive = (doc, p) => {
  let newDocument = Object.assign({}, doc._doc);
  for (var i = 0; i < p.length; i++) {
    newDocument = newDocument[p[i]];
  }
  return newDocument;
};

module.exports = {
  getDeviceConfigurationParameter: async function(deviceId, lookup) {
    try {
      let device = await Device.findOne({_id: deviceId}, 'parameters');
      let lookupPath = lookup.split('.');
      lookupPath.unshift('parameters');
      return lookupDive(device, lookupPath);
    } catch (error) {
      console.log(error);
    }
    
  }
};