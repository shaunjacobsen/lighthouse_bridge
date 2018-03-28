const express = require('express');
const mongodb = require('mongodb');
const { message } = require('./message.js');
const { Message } = require('./model.js');
const { Meta } = require('./../instances/metaModel.js');

module.exports = (app) => {
  app.post('/message', async (req, res) => {
    try {
      await message.checkValidityOfBody(req.body);
      await message.checkValidityOfRecipients(req.body.recipients);
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
      res.status(400).json(error);
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