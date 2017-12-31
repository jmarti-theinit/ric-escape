const isEmptyArg = require('../lib/common').isEmptyArg;
const aResponse = require('./scure-response').aResponse;

const addToInventory = (data, itemId) => {
  data.inventory = data.inventory || [];
  data.inventory.push(itemId);
  data.picked = data.picked || [];
  data.picked.push(itemId);
  return data;
};

const scurePickup = (itemName, data, scure) => {
  const roomId = data.roomId;
  const item = scure.items.getItemByName(itemName);

  if (isEmptyArg(itemName)) {
    return aResponse(scure.sentences.get('item-unknown'));
  } else if (!item) {
    return aResponse(scure.sentences.get('item-notseen', { name: itemName }));
  } else if (roomId !== item.location) {
    const name = item.name.toLowerCase();
    return aResponse(scure.sentences.get('item-notseen', { name }));
  } else if (!item.pickable) {
    const name = item.name.toLowerCase();
    return aResponse(scure.sentences.get('item-notpickable', { name }));
  } else if (scure.items.isPicked(item.id, data.picked)) {
    const name = item.name.toLowerCase();
    return aResponse(scure.sentences.get('item-alreadypicked', { name }));
  }
  const name = item.name.toLowerCase();
  addToInventory(data, item.id);
  return aResponse(scure.sentences.get('item-pickedup', { name }), data);
};

exports.scurePickup = scurePickup;
