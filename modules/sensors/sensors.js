const mongodb = require('mongodb');
const { redisClient } = require('./../../redis/redis');
const { getDeviceConfigurationParameter } = require('./../admin/parameterFunctions');
const { SensorData } = require('./model.js');

const sensor = {
  validateBody: async function(body) {
    let errors = [];
    if (!body.data || Object.keys(body.data).length === 0) {
      errors.push('no reading data sent');
    }
    return new Promise((resolve, reject) => {
      if (errors.length > 0) {
        reject({ errors });
      }
      resolve();
    });
  },

  compareReadings: async function(oldData, newData) {
    try {
      let deviceId = newData.deviceId;
      let reportType = newData.reportType;
      //let sensorDeltaThresholds = await getDeviceConfigurationParameter(deviceId, `sensors.${reportType}.deltaThresholds`);
      let differences = {};
      Object.keys(newData.data).forEach(dataPoint => {
        differences[dataPoint] = Math.round(newData.data[dataPoint] - oldData.data[dataPoint]);
      });
      console.log(differences);
      return differences;
    } catch (error) {
      console.log(error);
    }
  },

  getCurrentReading: async function(deviceId, readingType) {
    try {
      return await SensorData.findOne().where({deviceId: deviceId, reportType: readingType}).sort({ created: -1 });
    } catch (error) {
      console.log(error);
    }
  },

  saveSensorDataToRedis: async function(data) {
    Object.keys(data.data).forEach(dataPoint => {
      redisClient.hset(data.deviceId, dataPoint, data.data[dataPoint]);
    });
  },

  aggregateData: async function(deviceId, reportType, granularity, startTime, endTime) {
    try {
      let data = await SensorData
      .find()
      .where({ deviceId: deviceId, reportType: reportType })
      //.where({ granularity: { $lt: granularity } })
      .where({ created: { $lt: endTime, $gte: startTime } });
      // start at startTime and create an array of timestamps, where each iteration
      // pushes a new timestamp to the array (timestamp + granularity in ms)
      // stop when timestamp to push is > endTime.
      // OR do a while loop and check that the current working timestamp + granularity < endTime.
      let currentWorkingPeriod = startTime;
      let newReadings = [];
      do {
        let minimumTime = currentWorkingPeriod;
        let maximumTime = minimumTime + (granularity);
        let matchingRecords = data.filter(reading => {
          return ((reading.created >= minimumTime) && (reading.created < maximumTime));
        });
        if (matchingRecords.length === 0) {
          currentWorkingPeriod += granularity;
          continue;
        }
        let dataFields = Object.keys(matchingRecords[0].data);
        let dataPoints = {};
        dataFields.forEach(field => {
          dataPoints[field] = [];
        });
        matchingRecords.forEach(reading => {
          dataFields.forEach(field => {
            dataPoints[field].push(reading.data[field]);
          });
        });
        dataFields.forEach(field => {
          let workingArray = dataPoints[field];
          workingArray.sort((a, b) => a - b);
          let lowMid = Math.floor((workingArray.length - 1) / 2);
          let highMid = Math.ceil((workingArray.length - 1) / 2);
          let median = (workingArray[lowMid] + workingArray[highMid]) / 2;
          dataPoints[field] = median;
        });
        let newReading = new SensorData({
          created: currentWorkingPeriod,
          deviceId: deviceId,
          reportType: reportType,
          data: dataPoints,
          granularity: granularity,
        });
        newReadings.push(newReading);
        currentWorkingPeriod += granularity;
      } while ((currentWorkingPeriod + granularity) <= endTime);
      console.log('done aggregating');
      SensorData.insertMany(newReadings).then(() => {
        console.log('new records inserted');
        SensorData.deleteMany({
          deviceId: deviceId,
          reportType: reportType,
          created: { $lt: endTime, $gte: startTime },
          granularity: { $lt: granularity }
        }).then(() => {
          console.log('old records deleted');
        })
      });
      // iterate through each timestamp in the array, filter the data for created timestamp
      // greater than or equal to timestamp but less than the next timestamp in the array
      // if no next timestamp, 
    } catch (error) {
      console.log(error);
    }
  },
}

module.exports = { sensor };