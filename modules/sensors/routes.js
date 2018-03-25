const express = require('express');
const mongodb = require('mongodb');
const { redisClient } = require('./../../redis/redis');
const { SensorData } = require('./model.js');
const { getCurrentReading, compareReadingsAndReact, saveSensorDataToRedis, aggregateData } = require('./sensors.js');

module.exports = (app) => {
  app.post('/sensor', async (req, res) => {
    try {
      //let lastReading = await getCurrentReading(req.body.originatingDeviceId, req.body.reportType);
      let data = {
        deviceId: req.body.originatingDeviceId,
        created: req.body.reportTime,
        reportType: req.body.reportType,
        data: req.body.data,
        granularity: req.body.granularity,
      }
      let sensorData = new SensorData(data);
      let resp = await sensorData.save();
      saveSensorDataToRedis(data);
      //compareReadingsAndReact(lastReading, data);
      res.json(resp);
    } catch (error) {
      console.log(error);
    }
  });

  app.get('/sensor/aggregate', async (req, res) => {
    try {
      let data = await aggregateData('5ab3cb5e6f99f84d26e4150a', 'SI2017', 300000, 1521833391000, 1521919792000);
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