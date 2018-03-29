const { Device } = require('./../instances/deviceModel');
const { lookupDive } = require('./../../helpers/lookupDive');

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