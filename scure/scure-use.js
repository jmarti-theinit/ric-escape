const isEmptyArg = require('../lib/common').isEmptyArg;
const aResponse = require('./scure-response').aResponse;

const getUsedTimes = (item, usages) =>
  (usages && usages[item.id]) || 0;
const currentResponse = (item, usage, usages) =>
  usage.response[getUsedTimes(item, usages) % usage.response.length];
const getSentence = response =>
  (response.isUnlockingAction ? response.response : response);
const unlockIfUnlockingAction = (response, data) => {
  if (response.isUnlockingAction) {
    data.unlocked = data.unlocked || [];
    if (data.unlocked.indexOf(response.lock) === -1) {
      data.unlocked.push(response.lock);
    }
  }
};
const increaseUsage = (item, data) => {
  data.usages = data.usages || [];
  data.usages[item.id] = data.usages[item.id] || 0;
  data.usages[item.id] += 1;
};

const scureUse = (itemName, data, scure) => {
  if (isEmptyArg(itemName)) {
    return aResponse(scure.sentences.get('use-noarg'));
  }
  const item = scure.items.getItemByName(itemName);
  if (!item) {
    return aResponse(scure.sentences.get('use-cant'));
  }
  const usage = scure.usages.getByItemId(item.id);
  if (!usage) {
    return aResponse(scure.sentences.get('use-cant'));
  }
  const response = currentResponse(item, usage, data.usages);
  unlockIfUnlockingAction(response, data);
  increaseUsage(item, data);
  return aResponse(getSentence(response), data);
};

exports.scureUse = scureUse;
