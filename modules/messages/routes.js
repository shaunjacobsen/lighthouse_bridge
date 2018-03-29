const express = require('express');
const mongodb = require('mongodb');
const { message } = require('./message.js');
const { Message } = require('./model.js');
const { Meta } = require('./../instances/metaModel.js');

module.exports = (app) => {
  app.post('/message', async (req, res) => {
    try {
      let resp = await message.send(req.body);
      res.send(resp);
    } catch (error) {
      res.status(400).send({ errors: error.message });
    }
    
  });

  app.get('/messages/:deviceId', async (req, res) => {
    try {
      let activeMessages = await Message.find({ 'recipients.device._id': req.params.deviceId }).where('expires').gt(new Date().getTime()).select('originator type expires shortTitle title body behavior attributes').exec();
      res.json(activeMessages);
    } catch (error) {
      console.log(error);
    }
  });
}