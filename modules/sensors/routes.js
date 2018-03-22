const express = require('express');
const mongodb = require('mongodb');
const { SensorData } = require('./model.js');

module.exports = (app) => {
  app.post('/sensor', async (req, res) => {
    try {
      let data = {
        deviceId: req.body.originatingDeviceId,
        reportTime: req.body.reportTime,
        reportType: req.body.reportType,
        data: req.body.data,
      }
      let sensorData = new SensorData(data);
      let resp = await sensorData.save();
      res.json(resp);
    } catch (error) {
      console.log(error);
    }
    
  });

}