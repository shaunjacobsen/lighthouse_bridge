const express = require('express');
const axios = require('axios');
const pick = require('lodash/pick');

const { Device, deviceModel } = require('../instances/deviceModel');
const { hueRequester } = require('../../helpers/hueRequester');

function getHueCapabilities(light) {
  let capabilities = [];
  if (light.dimming) capabilities.push('dimmable');
  if (light.color) capabilities.push('colour');
  return capabilities;
}

function getHueType(light) {
  if (light.metadata.archetype === 'plug') return 'PLUG';
  if (light.type === 'light') return 'BULB';
  return light.type;
}

module.exports = (app) => {
  app.get('/devices', async (req, res) => {
    try {
      const devices = await Device.find({ isActive: true }).exec();
      res.json(devices);
    } catch (error) {
      console.log(error.response);
      res.status(400).json(error.message);
    }
  });

  app.post('/device', async (req, res) => {
    try {
      const details = pick(req.body, [
        'productName',
        'productVersion',
        'productIdentifier',
        'productSerial',
        'capabilities',
        'archetypes',
        'type',
        'friendlyName',
        'friendlyLocation',
        'isActive',
      ]);
      Device.create(details, (err, newDevice) => {
        if (err) throw new Error(err);
        res.json(newDevice);
      });
    } catch (e) {
      res.status(400).json(e.message);
    }
  });

  app.post('/devices/sync', async (req, res) => {
    try {
      const hueLights = await hueRequester.get('/resource/light');
      const promises = hueLights.data.data.map((light) => {
        return Device.findOneAndUpdate(
          { productIdentifier: light.id },
          {
            productName: `Philips Hue ${light.metadata?.archetype}`,
            productIdentifier: light.id,
            capabilities: getHueCapabilities(light),
            archetypes: [light.metadata?.archetype],
            friendlyName: light.metadata?.name,
            isActive: true,
            type: getHueType(light),
          },
          { new: true, upsert: true },
        );
      });
      const docs = Promise.all(promises);
      res.json(docs);
    } catch (error) {
      console.log(error);
    }
  });
};
