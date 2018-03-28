const express = require('express');
const axios = require('axios');

const { Device } = require('./../instances/deviceModel');

module.exports = (app) => {
  app.get('/admin/sync', async (req, res) => {
    try {
      let headers = { 'x-auth': req.headers['x-auth'] };
      let resp = await axios.get(`${process.env.SERVER_URL}/instances`, { headers: headers });
      res.json(resp.data);
    } catch (error) {
      console.log(error.response);
    }
  });

  app.get('/admin/devices', async (req, res) => {
    try {
      let devices = await Device.find({});
      res.json(devices);
    } catch (error) {
      console.log(error);
    }
  });
}