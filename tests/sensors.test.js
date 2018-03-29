const request = require('supertest');
const expect = require('expect');

const { app } = require('./../app');
const { constructInstance, devices, addSensorData, sensorData } = require('./seedData');

describe('Sensor reading submission', function() {

  beforeEach(() => {
    return constructInstance();
  });

  it('Should successfully submit a reading', async () => {
    const res = await request(app).post('/sensor').send(sensorData.firstReading);
    expect(res.statusCode).toBe(200);
  });

  it('Should not submit a reading with no data', async () => {
    const res = await request(app).post('/sensor').send(sensorData.readingWithNoData);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain('no reading data sent');
  });

});

describe('Stored sensor data reading', function() {

  beforeEach(async () => {
    await addSensorData();
    return constructInstance();
  });

  it('Should successfully return the latest reading for a specific device', async () => {
    const res = await request(app).get(`/sensor/${devices[0]._id}/latest`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('humidity');
    expect(res.body.data).toHaveProperty('temperature');
    expect(res.body.data.humidity).toBe(15);
    expect(res.body.data.temperature).toBe(21);
  });

});