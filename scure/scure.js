const isEmptyArg = require('../lib/common').isEmptyArg;

const joinMultipleStrings = (arr) => {
  if (arr.length === 1) return arr[0];
  return `${arr.slice(0, arr.length - 1).join(', ')} y ${arr[arr.length - 1]}`;
};

const isSynonym = (synonyms, name) => {
  const lcSyns = synonyms.map(it => it.toLowerCase());
  return lcSyns.indexOf(name.toLowerCase()) >= 0;
};

const isTextEqual = (name1, name2) => {
  if (isEmptyArg(name1) || isEmptyArg(name2)) return false;
  return name1.toLowerCase() === name2.toLowerCase();
};

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

  isAllowedDestination(destinationName, id) {
    const room = this.getRoomByName(destinationName);
    if (!room) return false;
    const destIds = this.data.map[id];
    return destIds.indexOf(room.id) >= 0;
  }

  getDestinationNamesFrom(id) {
    const destIds = this.data.map[id];
    const destNames = destIds.map(rId => this.getRoom(rId).name);
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

