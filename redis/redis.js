const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('connect', () => {
  console.log('connected to redis');
});

module.exports = { redisClient };