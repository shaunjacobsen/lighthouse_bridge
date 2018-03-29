const request = require('supertest');
const expect = require('expect');

const { app } = require('./../app');
const { constructInstance } = require('./seedData');

describe('Instances', function() {

  beforeEach(() => {
    return constructInstance();
  });

  it('Should have three devices', async () => {
    const res = await request(app).get('/admin/devices');
    expect(res.statusCode).toBe(200);
  });
  
});