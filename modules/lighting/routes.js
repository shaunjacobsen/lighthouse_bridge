const express = require('express');
const axios = require('axios');
const pick = require('lodash/pick');

const { Device, deviceModel } = require('./../instances/deviceModel');
const { hueRequester } = require('../../helpers/hueRequester');

function combineHueLightStatus(db, hue) {
  return db.map((dbLight) => {
    const hueLight = hue.find((i) => i.id === dbLight.productIdentifier);
    const hueData = pick(hueLight, [
      'color',
      'color_temperature',
      'color_temperature_delta',
      'dimming',
      'dimming_delta',
      'dynamics',
    ]);
    return {
      id: dbLight.id,
      info: dbLight,
      on: hueLight.on.on,
      ...hueData,
    };
  });
}

module.exports = (app) => {
  app.get('/lighting/lights', async (req, res) => {
    try {
      // get db lights
      const dbLights = await Device.find({ type: 'BULB' }).exec();
      const hueLights = await hueRequester.get('/resource/light');
      const merged = combineHueLightStatus(dbLights, hueLights.data.data);
      // get hue lights
      // merge on identifiers

      res.json(merged);
    } catch (error) {
      res.status(400).json(error.message);
    }
  });

  app.post('/lighting/light/:id', async (req, res) => {
    try {
      const device = await Device.findById(req.params.id).exec();
      if (!device) return res.status(404);

      const data = req.body;
      const hueRequest = await hueRequester.put(
        `/resource/light/${device.productIdentifier}`,
        data,
      );
      if (hueRequest.status > 200) {
        return res.status(400).json(hueRequest.data.errors);
      }
      return res.json(hueRequest.data);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  });
};
