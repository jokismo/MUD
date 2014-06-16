'use strict';

var _ = require('underscore');
var Q = require('q');
var async = require('async');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var serverName, server;

process.on('message', function(data) {
  serverName = data;
});

firebaseServices.auth()
  .then(function() {
    server = new InitServer(serverName);
    server.init();
    server.initGameData();
  }, function(err) {
    onError(serverName + ' Auth Error: ', err);
  });

function InitServer(name) {
  this.name = name;
  this.itemDb = {};
}

InitServer.prototype.init = function() {
  var connectedRef = firebaseRef('.info/connected');
  connectedRef.on('value', managePresence);
};

function managePresence(data) {
  var serverRef = firebaseRef(['serverList', 'battleServers', serverName]);
  if (data.val() === true) {
    serverRef.update({online: true});
    serverRef.onDisconnect().update({online: false});
    update(serverName + ' is Connected');
  } else {
    onError('Firebase Error: ', serverName + ' disconnected from Firebase');
  }
}

InitServer.prototype.initGameData = function() {
  this.dbInitTasks()
    .then(function() {
      initGameState();
    }, function(err) {
      onError('getItemDb Error: ', err);
    });
};

InitServer.prototype.dbInitTasks = function() {
  var deferred = Q.defer();
  var done = _.after(5, function() {
    deferred.resolve();
  });
  firebaseRef(['battleInitQueue'])
    .remove(function(err) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        done();
      }
    });
  firebaseRef(['serverList', 'Path Server'])
    .remove(function(err) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        done();
      }
    });
  firebaseRef(['activeNpcs'])
    .remove(function(err) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        done();
      }
    });
  firebaseRef(['tempMapData'])
    .remove(function(err) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        done();
      }
    });
  firebaseRef(['itemDbLite'])
    .once('value', function(data) {
      server.itemDb = data.val();
      done();
    }, function(err) {
      deferred.reject(new Error(err));
    });
};

function initGameState() {
  firebaseRef(['mapList'])
    .once('value', processMaps, function(err) {
      onError('initNPC Error: ', err);
    });
}

function processMaps(data) {
  var val = _.toArray(data.val());
  async.eachSeries(val, initMap,
    function(err){
      if (err) {
        onError('processMaps Error: ', err);
      } else {
        update('Game Status Init Complete, closing Init Server.');
        process.send('complete');
      }
    });
}

function initMap(mapName, asyncCallback) {
  var npcList, objectList;
  var successCallback = _.after(2, asyncCallback);
  npcList = new NpcList(mapName, asyncCallback, successCallback);
  firebaseRef(['npcLists', mapName])
    .once('value', quickBind(npcList.process, npcList), function(err) {
      asyncCallback('initMap Error: ' + err);
    });
  objectList = new ObjectList(mapName, asyncCallback, successCallback);
  firebaseRef(['objectLists', mapName])
    .once('value', quickBind(objectList.process, objectList), function(err) {
      asyncCallback('initMap Error: ' + err);
    });
}

function ObjectList(mapName, asyncCallback, successCallback) {
  this.mapName = mapName;
  this.mapRef = firebaseRef(['tempMapData', mapName]);
  this.npcRef = firebaseRef(['activeObjects', mapName]);
  this.asyncCallback = asyncCallback;
  this.successCallback = successCallback;
}

function NpcList(mapName, asyncCallback, successCallback) {
  this.mapName = mapName;
  this.mapRef = firebaseRef(['tempMapData', mapName]);
  this.aggroRef = firebaseRef(['aggroChecks'], mapName);
  this.npcRef = firebaseRef(['activeNpcs', mapName]);
  this.pathsRef = firebaseRef(['paths']);
  this.aggroChecks = {
    checks: {
      list: [],
      data: []
    },
    results: {
      list: [],
      data: []
    }
  };
  this.asyncCallback = asyncCallback;
  this.successCallback = successCallback;
}

NpcList.prototype.process = function(data) {
  var callback = this.asyncCallback;
  var successCallback = this.successCallback;
  var mapName = this.mapName;
  var aggroRef = this.aggroRef;
  var aggroChecks = this.aggroChecks.data;
  var processGroupTasks = [];
  var npcGroups = [];
  this.npcList = data.child('baseNpcList').val();
  this.npcGroupList = data.child('static').val();
  this.randList = data.child('rand').val();
  var length = this.randList.length, i;
  if (this.randList) {
    for (i = 0; i < length; ++i) {
      this.npcGroupList = this.npcGroupList.concat(this.processRandList(this.randList[i]));
    }
  }
  this.setHeroes(data.child('randHero').val());
  update(mapName + ' NPC list populated, generating NPCs');
  length = this.npcGroupList.length;
  for (i = 0; i < length; ++i) {
    npcGroups[i] = new NpcGroup(this.npcGroupList[i], this.npcList, this.mapRef, this.npcRef, this.pathsRef, this.mapName, this.aggroChecks);
    processGroupTasks.push(quickBind(npcGroups[i].process, npcGroups[i]));
  }
  async.parallel(processGroupTasks, function(err) {
    if (err) {
      callback('Error populating ' + mapName + ': ' + err);
    } else {
      aggroRef.set(aggroChecks, function(err) {
          if (err) {
            callback('Error setting aggroChecks ' + mapName + ': ' + err);
          } else {
            successCallback(null);
          }
        });
    }
  });
};

NpcList.prototype.setHeroes = function(randData) {
  var numHero, i, heroes = [], num, length = this.npcGroupList.length;
  if (!randData) {
    return;
  }
  if (randData.length === 1) {
    numHero = _.random(randData[0][0], randData[0][1]);
  } else {
    numHero = getRandomByProbability(randData);
  }
  for (i = 0; i < length; ++i) {
    if (this.npcGroupList[i].canHero) {
      heroes.push(i);
    }
  }
  length = heroes.length - 1;
  for (i = 0; i < numHero; ++i) {
    num = heroes.splice(_.random(0, length), 1);
    this.npcGroupList[num].isHero = true;
    --length;
  }
};

NpcList.prototype.processRandList = function(randList) {
  var groupList = [], returnList = [], numGroups;
  var length = randList.length, i, j, rand;
  for (i = 0; i < length; ++i) {
    // For Each Rand Logic Module
    rand = randList[i];
    // Generate Number of npc groups
    if (rand.groups.length === 1) {
      numGroups = _.random(rand.groups[0][0], rand.groups[0][1]);
    } else {
      numGroups = getRandomByProbability(rand.groups);
    }
    // Populate Each Group
    if (rand.groupComp.fixed) {
      for (j = 0; j < numGroups; ++j) {
        groupList.push(getRandomByProbability(rand.groupComp.fixed));
      }
    } else {
      for (j = 0; j < numGroups; ++j) {
        groupList.push(setLeaders(randomGroup(rand.groupComp.logic), this.npcList));
      }
    }
    // Add path info to Groups
    returnList = returnList.concat(setPaths(rand.link, rand.pathing, groupList));
  }
  return returnList;
};

function randomGroup(logic) {
  var numInGroup, newNpc, i;
  var group = [];
  var groupObj = {
    num: 1
  };
  if (logic.num.rand) {
    numInGroup = _.random(logic.num.rand[0], logic.num.rand[1]);
  } else {
    numInGroup = getRandomByProbability(logic.num.logic);
  }
  if (numInGroup === 1) {
    return getRandomByProbability(logic.pool);
  }
  for(i = 0; i < numInGroup; i++) {
    newNpc = getRandomByProbability(logic.pool);
    if (validateNewNpc(groupObj, newNpc, logic)) {
      group.push(newNpc);
      if (_.isUndefined(groupObj[newNpc])) {
        groupObj[newNpc] = 0;
      }
      groupObj[newNpc]++;
      groupObj.num++;
    } else {
      --i;
    }
  }
  return group;
}

function validateNewNpc(group, newNpc, logic) {
  var i;
  if (logic.req) {
    for (i = 0; i < logic.req.length; ++i) {
      if (group.num >= logic.req[i][0] &&
        _.isUndefined(group[logic.req[i][1]]) &&
        newNpc !== logic.req[i][1]) {
        return false;
      }
    }
  }
  if (logic.avoid) {
    for (i = 0; i < logic.avoid.length; ++i) {
      if (!_.isUndefined(group[logic.avoid[i][0]]) && newNpc === logic.avoid[i][1]) {
        return false;
      }
    }
  }
  if (logic.maxnum) {
    for (i = 0; i < logic.maxnum.length; ++i) {
      if (group.num >= logic.maxnum[i][0] &&
        newNpc === logic.maxnum[i][1] &&
        !_.isUndefined(group[logic.maxnum[i][1]]) &&
        group[logic.maxnum[i][1]] >= logic.maxnum[i][0]) {
        return false;
      }
    }
  }
  return true;
}

function setLeaders(groupList, npcList) {
  var i, j, group, length = groupList.length;
  for (i = 0; i < length; ++i) {
    group = _.clone(groupList[i].npcId);
    if (_.isArray(group)) {
      groupList[i].npcId = [];
      for (j = 0; j < group.length; ++j) {
        if (_.random(1, 100) <= npcList[group[j]].leadership[0]) {
          groupList[i].npcId.unshift(group[j]);
        } else {
          groupList[i].npcId.push(group[j]);
        }
      }
    }
  }
  return canHero(groupList, npcList);
}

function canHero(groupList, npcList) {
  var i, j, group, length = groupList.length;
  for (i = 0; i < length; ++i) {
    group = groupList[i].npcId;
    if (_.isArray(group)) {
      for (j = 0; j < group.length; ++j) {
        if (!npcList[group[j]].canHero) {
          groupList[i].canHero = false;
          break;
        }
        groupList[i].canHero = true;
      }
    } else {
      groupList[i].canHero = npcList[group].canHero;
    }
  }
  return groupList;
}

function setPaths(link, pathingLogic, groupList) {
  var i, path;
  for (i = 0; i < groupList.length; ++i) {
    groupList[i] = {
      // link for repop
      link: link,
      npcId: groupList[i],
      // get path
      path: (function () {
        if (!pathingLogic.prob) {
          path = pathingLogic.paths[_.random(0, (pathingLogic.paths.length - 1))];
        } else {
          path = pathingLogic.paths[getRandomByProbability(pathingLogic.prob)];
        }
        if (pathingLogic.noDouble) {
          pathingLogic.paths.splice(pathingLogic.paths.indexOf(path), 1);
        }
        return path;
      }())
    };
  }
  return groupList;
}

function NpcGroup(groupData, npcList, mapRef, npcRef, pathsRef, mapName, aggroChecks) {
  this.groupData = groupData;
  this.baseNpcList = npcList;
  this.mapRef = mapRef;
  this.npcRef = npcRef;
  this.pathRef = pathsRef.child(mapName).child(groupData.path.moveTime).push();
  this.groupId = this.pathRef.name();
  this.mapName = mapName;
  this.mapAggroChecks = aggroChecks;
}

NpcGroup.prototype.process = function(asyncCallback) {
  var i, aggroLogic, length, checkIndex, resultIndex, pathData = [];
  var aggroChecks = [];
  var npcList = [];
  var saveNpcTasks = [];
  var npcIds = {};
  var groupPos = false;
  var groupData = this.groupData;
  var successCallback = _.after(2, asyncCallback);
  if (!groupData.path.initPos) {
    groupData.path.initPos = setInitPos(groupData.path);
  }
  if (_.isArray(groupData.npcId)) {
    aggroLogic = this.baseNpcList[groupData.npcId[0]].aggro;
  } else {
    aggroLogic = this.baseNpcList[groupData.npcId].aggro;
    groupData.npcId = [groupData.npcId];
  }
  if (aggroLogic) {
    length = aggroLogic.length;
    for (i = 0; i < length; ++i) {
      if (this.mapAggroChecks.checks.list.indexOf(aggroLogic[i].check.id) !== -1) {
        this.mapAggroChecks.checks.list.push(aggroLogic[i].check.id);
        checkIndex = this.mapAggroChecks.checks.list.indexOf(aggroLogic[i].check.id);
        this.mapAggroChecks.checks.data.push({
          index: checkIndex,
          id: aggroLogic[i].check.id,
          logic: aggroLogic[i].check.logic
        });
      } else {
        checkIndex = this.mapAggroChecks.checks.list.indexOf(aggroLogic[i].check.id);
      }
      if (this.mapAggroChecks.results.list.indexOf(aggroLogic[i].result.id) !== -1) {
        this.mapAggroChecks.results.list.push(aggroLogic[i].result.id);
        resultIndex = this.mapAggroChecks.results.list.indexOf(aggroLogic[i].result.id);
        this.mapAggroChecks.results.data.push({
          index: resultIndex,
          id: aggroLogic[i].result.id,
          logic: aggroLogic[i].result.logic
        });
      } else {
        resultIndex = this.mapAggroChecks.checks.list.indexOf(aggroLogic[i].result.id);
      }
      aggroChecks.push([checkIndex, resultIndex]);
    }
  }
  length = groupData.npcId.length;
  for (i = 0; i < length; ++i) {
    if (length > 1) {
      groupPos = i;
    }
    npcList[i] = new Npc(this.groupId,
      this.baseNpcList[groupData.npcId[i]],
      groupData.link,
      groupData.isHero,
      groupData.path.initPos.initPos,
      groupPos,
      this.npcRef,
      this.mapRef,
      aggroChecks
    );
    npcList[i].init();
    npcIds[npcList[i].id] = [this.groupId, aggroChecks];
    saveNpcTasks.push(quickBind(npcList[i].save, npcList[i]));
  }
  if (groupData.path.move) {  // posNum, path, npcIds, mapName, multiData
    pathData.push(groupData.path.initPos.posNum);
    pathData.push(groupData.path.path);
    pathData.push(npcIds);
    pathData.push(this.mapName);
    if (!_.isUndefined(groupData.path.initPos.multiData)) {
      pathData.push(groupData.path.initPos.multiData);
    }
    this.pathRef.set(pathData, function(err) {
      if (err) {
        asyncCallback('initNpcGroups Error: ' + err);
      } else {
        successCallback(null);
      }
    });
  }
  async.parallel(saveNpcTasks, function(err) {
    if (err) {
      asyncCallback('initNpc Error: ' + err);
    } else {
      successCallback(null);
    }
  });
};

function setInitPos(path) {
  var length, pathArray, returnObj = {};
  if (path.multi) {
    length = path.path.length - 1;
    returnObj.multiData = {
      arrayIndex: _.random(0, length),
      pool: path.pool
    };
    pathArray = path.path[returnObj.multiData.arrayIndex];
  } else {
    pathArray = path.path;
  }
  length = pathArray.length - 1;
  returnObj.posNum = _.random(0, length);
  returnObj.initPos = pathArray[returnObj.posNum];
  return returnObj;
}

function Npc(groupId, baseNpc, repopLink, isHero, initPos, groupPos, npcRef,  mapRef, aggroChecks) {
  this.groupId = groupId;
  this.groupPos = groupPos;
  this.baseNpc = baseNpc;
  this.repopLink = repopLink;
  this.isHero = isHero;
  this.initPos = initPos;
  this.npcRef = npcRef.push();
  this.id = this.npcRef.name();
  this.nodeRef = mapRef.child('nodes/' + initPos[0] + '/' + initPos[1]);
  this.aggroChecks = aggroChecks;
  this.stats = {};
  this.props = [];
  this.inv = {};
  this.visibleInv = {};
  this.itemSkills = [];
}

Npc.prototype.init = function() {
  this.initStats();
  this.initInventory();
};
Npc.prototype.save = function(asyncCallback) {
  var successCallback = _.after(2, asyncCallback);
  var clientData = {
    isHero: this.isHero,
    visibleInv: this.visibleInv,
    triggers: this.clientTriggers
  };
  var serverData = {
    stats: this.stats,
    props: this.props,
    itemSkills: this.itemSkills,
    groupPos: this.groupPos,
    repopLink: this.repopLink,
    inv: this.inv,
    combatModule: this.baseNpc.combatModule
  };
  if (this.aggroChecks.length > 0) {
    this.nodeRef.child('idleNpcList').child(1).child(this.id).set([this.groupId, this.aggroChecks], function(err) {
      if (err) {
        asyncCallback('initNpc Error: ' + err);
      } else {
        successCallback(null);
      }
    });
  } else {
    this.nodeRef.child('nonCombatNpcList').child(this.id).set(this.groupId, function(err) {
      if (err) {
        asyncCallback('initNpc Error: ' + err);
      } else {
        successCallback(null);
      }
    });
  }
  this.npcRef.set([clientData, serverData], function(err) {
    if (err) {
      asyncCallback('initNpc Error: ' + err);
    } else {
      successCallback(null);
    }
  });
};
Npc.prototype.initStats = function() {
  var i, statMod, propsPool, numProps;
  if (!this.baseNpc.stats.randomize) {
    this.stats = this.baseNpc.stats.base;
  } else {
    for (i = 0; i < this.baseNpc.stats.randomize.length; ++i) {
      if (_.isArray(this.baseNpc.stats.randomize[i])) {
        this.stats[i] = this.baseNpc.stats.randomize[i][0] +
          _.random(this.baseNpc.stats.randomize[i][1], this.baseNpc.stats.randomize[i][2]);
      } else {
        statMod = getRandomByProbability(this.baseNpc.stats.randomize[i].rand);
        this.stats[i] =  this.baseNpc.stats.randomize[i].base +
          _.random(statMod[0], statMod[1]);
      }
    }
  }
  if (this.isHero) {
    this.stats[0] = this.stats[0] * (2 + (_.random(0, 10) / 10));
    this.stats[1] = this.stats[1] * (2 + (_.random(0, 10) / 10));
    this.props = this.baseNpc.props.base.hero;
  } else {
    this.props = this.baseNpc.props.base.normal;
  }
  if (this.baseNpc.props.randomize) {
    if (this.isHero) {
      numProps = getNumProps(this.baseNpc.props.hero);
    } else {
      numProps = getNumProps(this.baseNpc.props.normal);
    }
    propsPool = this.baseNpc.props.pool.length - 1;
    for (i = 0; i < numProps; ++i) {
      this.props.push(this.baseNpc.props.pool.splice(_.random(0, propsPool), 1));
      --propsPool;
    }
  }
};
function getNumProps(propsData) {
  if (propsData.length === 1) {
    return _.random(propsData[0], propsData[1]);
  } else {
    return getRandomByProbability(propsData);
  }
}
Npc.prototype.initInventory = function() {
  var i, length = this.baseNpc.inv.populate.length, slot;
  var logicNum = +this.isHero;
  for (i = 0; i < length; ++i) {
    if (_.isArray(this.baseNpc.inv.populate[i])) {
      slot = this.baseNpc.inv.populate[i][0];
      if (_.random(1, 100) > this.baseNpc.inv.populate[i][1][logicNum]) {
        continue;
      }
    } else {
      slot = this.baseNpc.inv.populate[i];
    }
    switch(this.baseNpc.inv.generateItems[slot].type) {
      case 0:
        if (_.isUndefined(this.inv.worn)) {
          this.inv.worn = {};
        }
        this.inv.worn[slot] = {};
        this.initWornEq(slot, logicNum);
        break;
      case 1:
        if (_.isUndefined(this.inv.misc)) {
          this.inv.misc = [];
        }
        this.initMatItem(logicNum);
        break;
      case 2:
        if (_.isUndefined(this.inv.misc)) {
          this.inv.misc = [];
        }
        this.initEqItem(logicNum);
        break;
      case 3:
        this.inv.bag = [];
        this.initBag(logicNum);
        break;
      case 4:
        if (_.isUndefined(this.inv.misc)) {
          this.inv.misc = [];
        }
        this.initShard(logicNum);
        break;
      default:
        update('initInventory Error: Unknown Case');
    }
  }
};

Npc.prototype.initShard = function(logicNum) {
  var skill, numProps, i, statsList, stat, shard = {
    stats: {}
  };
  var stats = this.stats;
  var logicRef = this.baseNpc.inv.generateItems.shard;
  numProps = 0;
  statsList = _.keys(stats);
  skill = getRandomByProbability(logicRef.skillPool[logicNum]);
  if (skill !== 0) {
    numProps = 1;
    shard.skill = skill;
  }
  for (i = numProps; i < 3; ++i) {
    stat = randFromArray(statsList);
    if (_.isUndefined(shard.stats[stat])) {
      shard.stats[stat] = 0;
    }
    shard.stats[stat] += stats[stat] / 10 | 0;
  }
  this.inv.misc.push(shard);
};

Npc.prototype.initEqItem = function(logicNum) {
  var tier, rank, itemGroup, item, itemId;
  var logicRef = this.baseNpc.inv.generateItems.miscEq;
  var eqItem = {};
  tier = randIdOrProb(logicRef.tier[logicNum]);
  rank = randIdOrProb(logicRef.rank[logicNum]);
  itemGroup = server.itemDb.randEqByTier[tier][rank];
  itemId = randFromArray(itemGroup);
  item = server.itemDb.list[itemId.slot][itemId.id];
  generateRandomEq(eqItem, tier, this.baseNpc.inv, item, itemId, false);
  this.inv.misc.push(eqItem);
};

Npc.prototype.initMatItem = function(logicNum) {
  var tier, rank, itemGroup, itemId, item;
  var logicRef = this.baseNpc.inv.generateItems.misc;
  tier = randIdOrProb(logicRef.tier[logicNum]);
  rank = randIdOrProb(logicRef.rank[logicNum]);
  itemGroup = server.itemDb.miscGroup[logicRef.itemGroup][tier][rank];
  itemId = randFromArray(itemGroup);
  item = server.itemDb.list.misc[itemId];
  this.inv.misc.push(item);
};

Npc.prototype.initBag = function(logicNum) {
  var itemId, item, itemGroup, rank, i;
  var bagRef = this.inv.bag;
  var visibleInvRef = this.visibleInv.bag;
  var bagLogic = this.baseNpc.inv.generateItems.bag;
  var numItems = 0;
  var weight = 0;
  var tier = randIdOrProb(bagLogic.tier[logicNum]);
  var tierList = server.itemDb.sorted.bags[tier];
  var bagId = randFromArray(tierList);
  var bag = server.itemDb.list.bags[bagId];
  var tierGroup = server.itemDb.randGroup[bagLogic.itemGroup][tier];
  while (weight < bag.maxWeight && numItems < bagLogic.max) {
    rank = randIdOrProb(bagLogic.rank[logicNum]);
    itemGroup = tierGroup[rank];
    itemId = randFromArray(itemGroup);
    item = server.itemDb.list[itemId.slot][itemId.id];
    weight += item.weight;
    if (weight > bag.maxWeight) {
      weight -= item.weight;
      if (bagLogic.min <= numItems) {
        break;
      } else {
        continue;
      }
    }
    bagRef[numItems] = {};
    generateRandomEq(bagRef[numItems], tier, this.baseNpc.inv, item, itemId, false);
    numItems++;
  }
  for (i = 0; i < bag.visible.ranges.length; ++i) {
    if (weight <= bag.visible.ranges[i].weight) {
      visibleInvRef = bag.visible.ranges[i].desc;
      break;
    }
  }
};

Npc.prototype.initWornEq = function(slot, logicNum) {
  var itemId, itemData, rand, item, mat, tier, rank;
  var invData = this.baseNpc.inv;
  var randLogic = invData.generateItems[slot];
  var eqItem = this.inv.worn[slot];
  rand = randLogic.rand[logicNum];
  if (rand) {
    mat = idOrProb(rand[0]);
    tier = idOrProb(rand[1]);
    rank = idOrProb(rand[2]);
    itemId = server.itemDb.sorted[mat][tier][rank][_.random(0, (server.itemDb.sorted[mat][tier][rank].length - 1))];
  } else {
    rand = randLogic.randFromGroup[logicNum];
    itemData = randIdOrProb(rand);
    tier = itemData[0];
    itemId = itemData[1];
  }
  item = server.itemDb.list[slot][itemId];
  generateRandomEq(eqItem, tier, invData, logicNum, item, itemId, true);
  wearEq(eqItem.stats, this.stats);
  this.visibleInv[slot] = item.visible;
  if (!_.isUndefined(item.skill)) {
    this.itemSkills.push(item.skill);
  }
};

function wearEq(eqItem, stats) {
  var itemStats = _.keys[eqItem];
  var i;
  for (i = 0; i < itemStats; ++i) {
    if (_.isUndefined(stats[itemStats[i]])) {
      stats[itemStats[i]] = 0;
    }
    stats[itemStats[i]] += eqItem[itemStats[i]];
  }
}

function generateRandomEq(eqItem, tier, npcLogic, logicNum, baseItem, baseItemId, isWorn) {
  var numProps, i, rank, prop, stat, propPool, statList;
  var props = {};
  eqItem.stats = {};
  eqItem.itemId = baseItemId;
  _.extend(eqItem.stats, baseItem.stats);
  // If item has native logic, defer to that
  if (!_.isUndefined(baseItem.numProps)) {
    numProps = modItemPropsSlots(baseItem.numProps[logicNum], npcLogic.itemDetails, logicNum, 'props');
  } else {
    numProps = modItemPropsSlots(server.itemDb.generators.numProps[tier][logicNum], npcLogic.itemDetails, logicNum, 'props');
  }
  // If item has propspool use that, else If npc has proppool and item is worn use proppool else tier pool
  if (!_.isUndefined(baseItem.propPool)) {
    propPool = baseItem.propPool[logicNum];
  } else if (isWorn && !_.isUndefined(npcLogic.itemDetails.propPool)) {
    propPool = npcLogic.itemDetails.propPool[logicNum];
  } else {
    propPool = server.itemDb.generators.propPool[tier][logicNum];
  }
  for (i = 0; i < numProps; ++i) {
    prop = randIdOrProb(propPool);
    if (_.isUndefined(props[prop])) {
      props[prop] = 0;
    }
    if (_.isUndefined(eqItem.stats[prop])) {
      eqItem.stats[prop] = 0;
    }
    if (!_.isUndefined(npcLogic.itemDetails.rank.stats)) {
      rank = randIdOrProb(npcLogic.itemDetails.rank.stats);
      statList = probListToRankList(server.itemDb.generators.itemStats[tier][logicNum][props[prop]]);
      if (_.isUndefined(statList[rank])) {
        stat = statList[statList.length - 1];
      } else {
        stat = statList[rank];
      }
    } else {
      stat = getRandomByProbability(server.itemDb.generators.itemStats[tier][logicNum][props[prop]]);
    }
    ++props[prop];
    eqItem.stats[prop] += stat;
  }
  if (!_.isUndefined(baseItem.slots)) {
    eqItem.slots = modItemPropsSlots(baseItem.slots[logicNum], npcLogic.itemDetails, logicNum, 'slots');
  } else {
    eqItem.slots = modItemPropsSlots(server.itemDb.generators.numSlots[tier][logicNum], npcLogic.itemDetails, logicNum, 'slots');
  }
}

function modItemPropsSlots(logic, npcLogic, logicNum, type) {
  var rank, numProps, rankList;
  // if npc has rank logic, get rank
  if (!_.isUndefined(npcLogic.rank[type])) {
    rank = randIdOrProb(npcLogic.rank[type][logicNum]);
    if (_.isUndefined(logic[rank])) {
      rankList = probListToRankList(logic);
      numProps = rankList[rankList.length - 1];
    } else {
      if (_.isArray(logic[rank])) {
        rankList = probListToRankList(logic);
        numProps = rankList[rank];
      } else {
        numProps = logic[rank];
      }
    }
  } else {
    numProps = randIdOrProb(logic);
  }
  return numProps;
}

function probListToRankList(probList) {
  var i, newArray = [];
  for (i = 0; i < probList.length; ++i) {
    newArray.push(probList[i][1]);
  }
  newArray.sort(function(a, b) {
    return a - b;
  });
  return newArray;
}

function getRandomByProbability(probList) {
  var length = probList.length, i;
  for (i = 1; i < length; ++i) {
    if (_.random(1, 100) <= probList[i][0]) {
      return probList[i][1];
    }
  }
  return probList[0][1];
}

function randFromArray(array) {
  return array[_.random(0, (array.length - 1))];
}

function idOrProb(data) {
  if (_.isArray(data)) {
    return getRandomByProbability(data);
  } else {
    return data;
  }
}

function randIdOrProb(data) {
  if (_.isArray(data)) {
    return getRandomByProbability(data);
  } else {
    return data[_.random(0, (data.length - 1))];
  }
}

function onError(text, error) {
  console.error(text + ' ' + error);
  restartInit();
}

function update(text) {
  console.log(text);
}

function quickBind(func, context) {
  return function() {
    func.apply(context, arguments);
  };
}

function restartInit() {
  update('Restarting Init in 2 minutes...');
  setTimeout(server.initGameData, 120000);
}

