const isEmptyArg = require('../lib/common').isEmptyArg;
const isTextEqual = require('./scure-commons').isTextEqual;
const joinMultipleStrings = require('./scure-commons').joinMultipleStrings;
const isSynonym = require('./scure-commons').isSynonym;

class ScureSentences {
  constructor(data) {
    this.data = data;
  }

  get(key, args) {
    if (!args || args.length === 0) return this.data.sentences[key];
    const replacer = (s1, s2) => s1.replace(`{${s2}}`, args[s2]);
    return Object.keys(args).reduce(replacer, this.data.sentences[key]);
  }
}

class ScureUsages {
  constructor(data) {
    this.data = data;
  }

  getByItemId(itemId) {
    return this.data.usages.find(i => i.items === itemId);
  }
}
class ScureItems {
  constructor(data) {
    this.data = data;
  }

  getItem(id) {
    return this.data.items.find(i => i.id === id);
  }

  getItemByName(name) {
    if (isEmptyArg(name)) return null;
    return this.data.items.find(i => isTextEqual(i.name, name) || isSynonym(i.synonyms, name));
  }
}

class ScureRooms {
  constructor(data) {
    this.data = data;
  }

  getRoom(id) {
    return this.data.rooms.find(r => r.id === id);
  }

  getRoomByName(name) {
    return this.data.rooms.find(r => isTextEqual(r.name, name) || isSynonym(r.synonyms, name));
  }

  getUnlockedDestinationsIds(fromId, unlocked) {
    const isUnlocked = destination => (unlocked && unlocked.indexOf(destination.lock) >= 0);
    const getId = (destination) => {
      if (!destination.isLockedDestination) return destination;
      if (isUnlocked(destination)) return destination.roomId;
      return null;
    };

    return this.data.map[fromId].map(getId).filter(d => d !== null);
  }

  isAllowedDestination(destinationName, id, unlocked) {
    const room = this.getRoomByName(destinationName);
    if (!room) return false;
    const destIds = this.getUnlockedDestinationsIds(id, unlocked);
    return destIds.indexOf(room.id) >= 0;
  }

  getPossibleDestinationNamesFrom(id, unlocked) {
    const unlockedIds = this.getUnlockedDestinationsIds(id, unlocked);
    const destNames = unlockedIds.map(rId => this.getRoom(rId).name);
    return joinMultipleStrings(destNames);
  }
}

class Scure {
  constructor(data) {
    this.data = data;
    this.sentences = new ScureSentences(data);
    this.items = new ScureItems(data);
    this.rooms = new ScureRooms(data);
    this.usages = new ScureUsages(data);
  }

  getInit() {
    return this.data.init;
  }
}

const buildScureFor = data => new Scure(data);

exports.buildScureFor = buildScureFor;

