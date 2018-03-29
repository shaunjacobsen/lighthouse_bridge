const express = require('express');
const mongodb = require('mongodb');
const { redisClient } = require('./../../redis/redis');
const { SensorData } = require('./model.js');
const { sensor } = require('./sensors.js');
const { eventService } = require('./../eventService/eventService');
const { getPropByString } = require('./../../helpers/getObjectNestedPaths');

module.exports = (app) => {

  app.post('/sensor', async (req, res) => {
    try {
      await sensor.validateBody(req.body);
      let lastReading = await sensor.getCurrentReading(req.body.originatingDeviceId, req.body.reportType);
      let data = {
        deviceId: req.body.originatingDeviceId,
        created: req.body.reportTime,
        reportType: req.body.reportType,
        data: req.body.data,
        granularity: req.body.granularity,
      }
      let sensorData = new SensorData(data);
      let resp = await sensorData.save();
      sensor.saveSensorDataToRedis(data);
      await eventService.emit('newSensorReading', {
        type: 'lighthouseDevice',
        id: data.deviceId,
      }, {
        data: {
          current: data.data,
          delta: await sensor.compareReadings(lastReading, data),
        },
      });
      res.json(resp);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  app.get('/sensor/aggregate', async (req, res) => {
    try {
      let data = await sensor.aggregateData('5ab3cb5e6f99f84d26e4150a', 'SI2017', 300000, 1521833391000, new Date().getTime());
      res.json(data);
    } catch (error) {
      
    }
  });

  app.get('/sensor/:deviceId', async (req, res) => {
    let data;
    try {
      if (req.query.start > 0) {
        data = await SensorData.find().where({ deviceId: req.params.deviceId }).where({ created: { $gt: req.query.start }});
      } else {
        data = await SensorData.find({ deviceId: req.params.deviceId });
      }
      res.json(data);
    } catch (error) {
      res.send('Error');
    }
  });

  app.get('/sensor/:deviceId/latest', async (req, res) => {
    try {
      let data = await SensorData.findOne().where({ deviceId: req.params.deviceId }).sort({ created: -1 });
      res.json(data);
    } catch (error) {
      res.send('Error');
    }
  });

}