const mongoose = require('mongoose');
const keyPath = require('key-path');
const axios = require('axios');

const { Device } = require('./../instances/deviceModel');
const { message } = require('./../messages/message');
const { getPropByString } = require('./../../helpers/getObjectNestedPaths');

const eventService = {
  emit: async function(eventType, originator, payload) {
    try {
      // query for devices
      let subscribedDevices = await Device.find({})
      .where({ 'eventListeners.eventType': eventType })
      .where({ 'eventListeners.originator': originator })
      .select('_id eventListeners.actions eventListeners.eventTrigger');
      let relevantTriggers;
      let triggerInvocationData = [];
      subscribedDevices.forEach(device => {
        relevantTriggers = device.eventListeners.filter(listener => {
          return doesObjectContainKeyForPath(payload, listener.eventTrigger.dataIdentifier.split('.'));
        });
        triggerInvocationData.push({
          device,
          triggers: relevantTriggers,
          payload,
        });
      });
      handleTriggers(triggerInvocationData);
    } catch (error) {
      console.log(error);
    }
  },

}

const handleTriggers = (triggerInvocationData) => {
  triggerInvocationData.forEach(invocation => {
    invocation.triggers.forEach(trigger => {
      invokeActions(invocation.device, trigger.actions);
    });
    
  });
}

const invokeActions = (device, actions) => {
  actions.forEach(action => {
    invokeAction(device._id, action);
  });
}

const invokeAction = async (recipient, action) => {
  if (action.type === 'message') {
    let messagePayload = {
      title: action.title,
      shortTitle: action.shortTitle,
      body: action.body,
      expires: new Date().getTime() + action.expiry,
      recipients: [recipient],
    };
    await message.send(messagePayload);
  }
}

const doesObjectContainKeyForPath = (obj, kP) => {
  return !!keyPath.get(kP).getValueFrom(obj);
}

module.exports = { eventService };