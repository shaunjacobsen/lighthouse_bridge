const express = require('express');
const mongodb = require('mongodb');
const { message } = require('./message.js');
const { Message } = require('./model.js');
const { Meta } = require('./../instances/metaModel.js');

module.exports = (app) => {
  app.post('/message', async (req, res) => {
    try {
      let data = {
        originator: req.body.originator,
        type: req.body.type,
        shortTitle: req.body.shortTitle,
        title: req.body.title,
        body: req.body.body,
        behavior: req.body.behavior,
        attributes: req.body.attributes,
        expires: req.body.expires,
        recipients: req.body.recipients,
      }
      let resp = await message.new(data);
      await message.distribute(resp);
      res.send(resp);
    } catch (error) {
      console.log(error);
    }
    
  });

  app.get('/messages', async (req, res) => {
    try {
      let deviceId = '5aa9a08c93828e00144dc470';
      let activeMessages = await Message.find({ 'recipients.device._id': deviceId }).where('expires').gt(new Date().getTime()).select('originator type expires shortTitle title body behavior attributes').exec();
      res.json(activeMessages);
    } catch (error) {
      
    }
  });
}