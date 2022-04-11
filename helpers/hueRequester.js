const axios = require('axios');

const hueRequester = axios.create({
  baseURL: `https://${process.env.HUE_HOST}/clip/v2`,
  headers: { 'hue-application-key': process.env.HUE_APPLICATION_KEY },
  rejectUnauthorized: false
});

module.exports = { hueRequester };
