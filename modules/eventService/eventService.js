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
      .select('_id eventListeners.actions eventListeners.eventTrigger eventListeners.originator');
      let relevantTriggers;
      let triggerInvocationData = [];
      subscribedDevices.forEach(device => {
        relevantTriggers = device.eventListeners.filter(listener => {
          let dataPath = listener.eventTrigger.dataIdentifier.split('.');
          if (doesObjectContainKeyForPath(payload, dataPath)) {
            let dataValue = keyPath.get(dataPath).getValueFrom(payload);
            if (dataValue >= listener.eventTrigger.threshold) {
              return true;
            }
            switch (listener.eventTrigger.condition) {
              case '>':
              if (dataValue > listener.eventTrigger.threshold) {
                return true;
              }
              break;
              case '>=':
              if (dataValue >= listener.eventTrigger.threshold) {
                return true;
              }
              break;
              case '<':
              if (dataValue < listener.eventTrigger.threshold) {
                return true;
              }
              break;
              case '<=':
              if (dataValue <= listener.eventTrigger.threshold) {
                return true;
              }
              break;
              case '=':
              if (dataValue === listener.eventTrigger.threshold) {
                return true;
              }
              break;
              default:
              if (dataValue === listener.eventTrigger.threshold) {
                return true;
              }
              break;
            }
          }
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
    invocation.triggers.forEach(async (trigger) => {
      let originatingDevice;
      try {
        originatingDevice = await getDeviceInformation(trigger.originator.id);
      } catch (error) {
        console.log(error);
      }
      invokeActions(invocation.device, trigger.actions, { data: invocation.payload, originator: originatingDevice });
    });
    
  });
}

const invokeActions = (device, actions, payload) => {
  actions.forEach(action => {
    invokeAction(device, action, payload);
  });
}

const invokeAction = async (recipient, action, payload) => {
  if (action.type === 'message') {
    let messagePayload = {
      title: action.title,
      shortTitle: action.shortTitle,
      body: substitutePlaceholders(action.body, payload),
      expires: new Date().getTime() + action.expiry,
      recipients: [recipient._id],
    };
    try {
      await message.send(messagePayload);
    } catch (error) {
      console.log(error);
    }
  }
}

const substitutePlaceholders = (rawText, data) => {
  const placeholderPattern = new RegExp('{{1}[A-z0-9\.]+}{1}', 'g');
  let replacements = rawText.match(placeholderPattern);
  let rawTextCopy = rawText.slice();
  replacements.forEach(replacement => {
    const extractedTextPattern = new RegExp('[A-z0-9\.]+');
    const dataLookupPath = replacement.match(extractedTextPattern);
    const replacementValue = keyPath.get(dataLookupPath[0]).getValueFrom(data);
    rawTextCopy = rawTextCopy.replace(replacement, replacementValue);
  });
  return rawTextCopy;
}

const getDeviceInformation = async (id) => {
  try {
    let device = await Device.findById(id);
    return device;
  } catch (error) {
    return error;
  }
}

const doesObjectContainKeyForPath = (obj, kP) => {
  let result = keyPath.get(kP).getValueFrom(obj);
  return ((typeof result === 'number') || (typeof result === 'string'));
}

module.exports = { eventService };