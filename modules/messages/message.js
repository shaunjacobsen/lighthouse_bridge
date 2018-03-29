const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const { Message, MessageRecipient } = require('./model.js');
const { Device } = require('./../instances/deviceModel');
let { db } = require('./../../db/db');
const { Distribution } = require('./queue');

function determineRecipients(recipients) {
  return Device.find({ _id: { '$in': recipients } }).then(doc => {
    return doc.map(device => {
      return new MessageRecipient({
        device: device,
      });
    });
  }).catch(e => console.log(e));
}

let message = {
  send: async function(data) {
    try {
      await this.checkValidityOfBody(data);
      await this.checkValidityOfRecipients(data.recipients);
      let payload = {
        originator: data.originator,
        type: data.type,
        shortTitle: data.shortTitle,
        title: data.title,
        body: data.body,
        behavior: data.behavior,
        attributes: data.attributes,
        expires: data.expires,
        recipients: data.recipients,
      }
      let resp = await this.new(payload);
      await this.distribute(resp);
      return resp;
    } catch (error) {
      throw new Error(error.errors);
    }
    
  },

  new: async function(data) {
    try {
      let newMessage = new Message({
        originator: data.originator,
        recipients: await determineRecipients(data.recipients),
        type: data.type,
        shortTitle: data.shortTitle,
        title: data.title,
        body: data.body,
        behavior: data.behavior,
        attributes: data.attributes,
        expires: data.expires,
      });
      return await newMessage.save();
    } catch (error) {
      console.log("ERR", error);
    }
  },

  distribute: async function(data) {
    try {
      data.recipients.forEach(recipient => {
        let outgoingData = {
          destination: recipient.device._id,
          payload: {
            id: data._id,
            type: data.type,
            shortTitle: data.shortTitle,
            title: data.title,
            body: data.body,
            behavior: data.behavior,
            attributes: data.attributes,
            expires: data.expires,
          }
        }
        Distribution.out(JSON.stringify(outgoingData));
      });
    } catch (error) {
      throw new Error("Error distributing message:", error);
    }
  },

  checkValidityOfBody: function(data) {
    let errors = [];
    return new Promise((resolve, reject) => {
      if (!data.recipients || data.recipients.length === 0) {
        errors.push('recipients not specified');
      }
      if (!data.title || data.title.length === 0) {
        errors.push('title not specified');
      }
      if (!data.body || data.body.length === 0) {
        errors.push('body not specified');
      }
      if (errors.length > 0) {
        reject({ errors });
      }
      resolve();
    });
  },

  checkValidityOfRecipients: async function(recipients) {
    let validObjectIds = recipients.filter(recipient => {
      return ObjectID.isValid(recipient);
    });

    return new Promise(async (resolve, reject) => {
      if (validObjectIds.length === 0) {
        reject({ errors: 'invalid recipients' });
      }
  
      if (validObjectIds.length < recipients.length) {
        let invalidObjectIds = recipients.filter(recipient => {
          return !ObjectID.isValid(recipient);
        });
        reject({ errors: 'invalid recipients' });
      }

      try {
        let recipientsInInstance = await checkDeviceIds(recipients);
        if (recipientsInInstance.length < recipients.length) {
          let recipientsNotInInstance = recipients.filter(recipient => {
            return !recipients.includes(recipientsInInstance);
          });
          reject({ errors: 'invalid recipients' });
        }
      } catch (error) {
        reject({ errors: 'invalid recipients' });
      }
      
      resolve();
    });

  }

}

const checkDeviceIds = async (recipients) => {
  let validObjectIds = recipients.filter(recipient => {
    return ObjectID.isValid(recipient);
  });

  try {
    let validDevices = await Device.find({ '_id': { '$in': validObjectIds } });
    return validDevices;
  } catch (error) {
    return [];
  }
}

module.exports = { message };