const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Message, MessageRecipient } = require('./../modules/messages/model');
const { Device } = require('./../modules/instances/deviceModel');
const { Instance } = require('./../modules/instances/instanceModel');
const { Meta } = require('./../modules/instances/metaModel');
const { SensorData } = require('./../modules/sensors/model');

const instanceId = new ObjectID();
const beaconDeviceId = new ObjectID();
const panelDeviceId = new ObjectID();
const mirrorDeviceId = new ObjectID();

const beaconDevice = new Device({
  _id : beaconDeviceId,
  capabilities: [],
  friendlyName: "Kitchen Beacon",
  friendlyLocation: "Kitchen",
  productName: "Beacon",
  productVersion: "0.1",
  productIdentifier: "B010",
  productSerial: "AB845739452GB0283",
  isActive: true,
  parameters: {
      sensors: {
          SI2017: {
              deltaThresholds: {
                  temperature: 5,
                  humidity: 10
              }
          }
      }
  }
});

const panelDevice = new Device({
  _id : panelDeviceId,
  capabilities: [],
  friendlyName: "Living Room Panel",
  friendlyLocation: "Living Room",
  productName: "Panel",
  productVersion: "0.1",
  productIdentifier: "P010",
  productSerial: "AP04751308P49843",
  isActive: true,
  parameters: {}
});

const mirrorDevice = new Device({
  _id : mirrorDeviceId,
  capabilities: [],
  friendlyName: "Living Room Mirror",
  friendlyLocation: "Living Room",
  productName: "Mirror",
  productVersion: "0.1",
  productIdentifier: "M010",
  productSerial: "AM09874359834B284723",
  isActive: true,
  parameters: {}
});

const devices = [beaconDevice, mirrorDevice, panelDevice];

const instance = new Instance({
  _id: instanceId,
  users: ['5a85f04e6b7338b0a6234c1f'],
  devices: devices,
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: instanceId, access: 'auth'}, process.env.JWT_SECRET).toString(),
  }]
});

const instanceMeta = new Meta({
  instance: instance,
});

const removeAndAddDevices = () => {
  return new Promise((resolve, reject) => {
    Device.remove({}).then(() => {
      Device.insertMany(devices).then(() => {
        resolve();
      }).catch((e) => reject(e));
    });
  });
}

const removeAndAddInstanceMeta = () => {
  return new Promise((resolve, reject) => {
    Meta.remove({}).then(() => {
      Meta.insert(instanceMeta).then(() => {
        resolve();
      });
    });
  });
}

const removeMessages = async () => {
  try {
    await Message.remove({});
  } catch (error) {
    console.log(error);
  }
}

const constructInstance = async () => {
  await removeAndAddDevices();
}


module.exports = { constructInstance, removeMessages, devices };