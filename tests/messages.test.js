const request = require('supertest');
const expect = require('expect');

const { app } = require('./../app');
const { constructInstance, devices, removeMessages } = require('./seedData');

const oneHourFromNow = new Date().getTime() + 3600000;

const sampleMessage = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  expires: oneHourFromNow,
  recipients: [devices[1]._id],
  attributes: {
    color: "708090",
  },
};

const sampleMessageWithMultipleRecipients = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  expires: oneHourFromNow,
  recipients: [devices[1]._id, devices[2]._id],
  attributes: {
    color: "708090",
  },
};

const sampleMessageWithoutSpecifiedExpiration = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  recipients: [devices[1]._id],
  attributes: {
    color: "708090",
  },
};

const sampleMessageWithNoRecipients = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  recipients: [],
};

const sampleMessageWithEmptyBody = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "",
  recipients: [],
};

const sampleMessageWithNoBody = {
  shortTitle: "Alert",
  title: "Weather Alert",
  recipients: [],
};

const sampleMessageWithEmptyTitle = {
  shortTitle: "Alert",
  title: "",
  body: "Sample body",
  recipients: [],
};

const sampleMessageWithNoTitle = {
  shortTitle: "Alert",
  body: "Sample body",
  recipients: [],
};

const sampleMessageWithInvalidRecipientId = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  recipients: ["invalidDeviceId"],
}

const sampleMessageWithInvalidRecipient = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  recipients: ["5aa9a08c93828e00144dc000"],
}

const sampleMessageWithValidAndInvalidRecipients = {
  shortTitle: "Alert",
  title: "Weather Alert",
  body: "In Chicago, Spring never arrives early.",
  recipients: [devices[1]._id, devices[2]._id, "invalidId", "5aa9a08c93828e00144dc470"],
}

const emptyMessage = {};

describe('Messaging', function() {

  beforeEach(() => {
    return constructInstance();
  });

  afterEach(() => {
    return removeMessages;
  })

  it('Should add a message', async () => {
    const res = await request(app).post('/message').send(sampleMessage);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('expires');
    expect(res.body.expires).toBe(oneHourFromNow);
  });

  it('Should add a message with multiple recipients', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithMultipleRecipients);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('expires');
    expect(res.body.expires).toBe(oneHourFromNow);
  });

  it('Should add a message with an expiration 1 hour from now, +/- 3 seconds, if not specified', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithoutSpecifiedExpiration);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('expires');
    expect(res.body.expires).toBeGreaterThanOrEqual(oneHourFromNow - 3000);
    expect(res.body.expires).toBeLessThanOrEqual(oneHourFromNow + 3000);
  });

  it('Should not add a message with no recipients', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithNoRecipients);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("recipients not specified");
  });

  it('Should not add a message with no body', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithNoBody);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("body not specified");
  });

  it('Should not add a message with empty body', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithEmptyBody);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("body not specified");
  });

  it('Should not add a message with no title', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithNoTitle);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("title not specified");
  });

  it('Should not add a message with empty title', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithEmptyTitle);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("title not specified");
  });

  it('Should return multiple errors for an empty request body', async () => {
    const res = await request(app).post('/message').send(emptyMessage);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(3);
    expect(res.body.errors).toContain("title not specified");
    expect(res.body.errors).toContain("body not specified");
    expect(res.body.errors).toContain("recipients not specified");
  });

  it('Should not add a message with an invalid recipient ID', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithInvalidRecipientId);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("invalid recipients");
  });

  it('Should not add a message with a recipient that does not exist in this instance', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithInvalidRecipient);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("invalid recipients");
  });

  it('Should not add a message with a combination of valid and invalid recipients', async () => {
    const res = await request(app).post('/message').send(sampleMessageWithValidAndInvalidRecipients);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContain("invalid recipients");
  });
  
});