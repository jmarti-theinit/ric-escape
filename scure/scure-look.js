const isEmptyArg = require('../lib/common').isEmptyArg;
const aResponse = require('./scure-response').aResponse;
const getPossibleDestinationsSentence = require('./scure-commons').getPossibleDestinationsSentence;
const getDescription = require('./scure-commons').getDescription;

const ROOM_SYNS = ['habitación', 'habitacion', 'lugar', 'lugares'];

const scureLook = (itemName, data, scure) => {
  const roomId = data.roomId;
  const item = scure.items.getBestItem(itemName, roomId, scure);
  if (isEmptyArg(itemName) || (ROOM_SYNS.indexOf(itemName) >= 0)) {
    const room = scure.rooms.getRoom(roomId);
    return aResponse(
      `${getDescription(room.description, data, scure)} ${getPossibleDestinationsSentence(scure, data)}`
    );
  }
  if (!item) {
    return aResponse(scure.sentences.get('item-not-in-location'));
  }
  const isInInventory = scure.items.isInInventory(item.id, data.inventory);
  const isInLocation = (item.location === null) ||
    (roomId === item.location && item.location !== null);
  if (!isInInventory && !isInLocation) {
    return aResponse(scure.sentences.get('item-not-in-location'));
  }
  return aResponse(getDescription(item.description, data, scure));
};

exports.scureLook = scureLook;
