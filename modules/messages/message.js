const mongoose = require('mongoose');
const { Message, MessageRecipient } = require('./model.js');
const { Device } = require('./../instances/deviceModel');
let { db } = require('./../../db/db');
const { Distribution } = require('./queue');

function determineRecipients(recipients) {
  return Device.find({ _id: recipients }).then(doc => {
    return doc.map(device => {
      return new MessageRecipient({
        device: device,
      });
    });
  }).catch(e => console.log(e));
}

let message = {
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

}

module.exports = { message };