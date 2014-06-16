'use strict';

var _ = require('underscore'),
  Q = require('q'),
  firebaseServices = require('../firebaseServices'),
  firebaseRef = firebaseServices.firebaseRef,
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  PathingService = require('./pathingService'),
  targetService = require('./targetService'),
  Npc = require('./npc'),
  Pc = require('./pc'),
  Obj = require('./obj'),
  helpers = require('../helpers'),
  quickBind = helpers.quickBind,
  onError = helpers.onError,
  update = helpers.update;

function BattleManager(mapName, row, col, npcId, charId, mapRef, tempMapRef, activeCharsRef, npcRef, pcRef, activeBattleRef, objRef, controllerRef) {
  this.refs = {
    mapNode: mapRef.child(mapName).child('nodes').child(row).child(col),
    map: tempMapRef.child(mapName).child('nodes').child(row).child(col),
    char: activeCharsRef.child(mapName),
    npcs: npcRef.child(mapName),
    pcs: pcRef,
    obj: objRef.child(mapName),
    battle: activeBattleRef.push(),
    battleName: this.refs.battle.name()
  };
  this.selfRef = {
    ref: controllerRef,
    row: row,
    col: col,
    mapName: mapName
  };
  this.initData = {
    pc: charId,
    npc: npcId
  };
  this.queues = {
    pcInit: []
  };
  this.battleData = {
    count: {
      total: 0,
      pcs: 0,
      npcs: 0,
      obj: 0
    },
    npcs: {},
    pcs: {},
    obj: {}
  };
  this.targetService = targetService;
}


util.inherits(BattleManager, EventEmitter);

BattleManager.prototype.init = function() {
  var self = this;
  Q.all([this.initNodeData(2),
      this.setCombatState(2),
      this.initPathingService(2)])
    .then(quickBind(this.initAssets, this))
    .then(quickBind(this.pathfindingConfig, this))
    .then(quickBind(this.targetConfig, this))
    .then(quickBind(this.initBattle, this))
    .catch(quickBind(this.handleErrors, this))
    .done(function(reInit) {
      if (reInit) {
        self.init();
      }
    });
};

BattleManager.prototype.initNodeData = function(numRetries) {
  return firebaseServices.getDataOnce(this.refs.map, numRetries)
    .then(quickBind(this.countAssets, this))
    .then(quickBind(this.initAssets, this));
};

BattleManager.prototype.countAssets = function(nodeData) {
  nodeData = nodeData.val();
  this.battleData.count.pcs = this.countObj(nodeData, 'idlePcList');
  if (this.battleData.count.pcs === 0) {
    if (this.queues.pcInit.length > 0) {
      this.queues.pcInit = [];
      throw new Error('ReInit');
    } else {
      throw new Error('Init Error No Pcs Found.');
    }
  }
  this.battleData.count.npcs = this.countObj(nodeData, 'idleNpcList');
  this.battleData.count.obj = this.countObj(nodeData, 'ObjList');
  this.battleData.count.total = this.battleData.count.pcs + this.battleData.count.npcs + this.battleData.count.obj;
  return nodeData;
};

BattleManager.prototype.countObj = function(data, type) {
  var list, numObj;
  if (!_.isUndefined(data[type][1])) {
    data = data[type][1];
    list = _.keys(data);
    numObj = list.length;
    if (numObj === 0) {
      return 0;
    }
  } else {
    return 0;
  }
  return numObj;
};

BattleManager.prototype.initAssets = function(nodeData) {
  var taskList = [this.initAsset(nodeData.idlePcList[1], 'pcs', Pc)];
  if (this.battleData.count.npcs > 0) {
    taskList.push(this.initAsset(nodeData.idleNpcList[1], 'npcs', Npc));
  }
  if (this.battleData.count.obj > 0) {
    taskList.push(this.initAsset(nodeData.objList[1], 'obj', Obj));
  }
  return Q.all(taskList);
};

BattleManager.prototype.initAsset = function(data, type, Constructor) {
  var list, num, i, taskArray;
  list = _.keys(data);
  num = list.length;
  taskArray = new Array(num);
  for (i = 0; i < num; ++i) {
    this.battleData[type][list[i]] = new Constructor(list[i], data[i], this);
    taskArray[i] = this.battleData[type][list[i]].init();
  }
  return Q.allSettled(taskArray)
    .then(quickBind(this.deleteUninitAsset, this, [type, list]));
};

BattleManager.prototype.deleteUninitAsset = function(data, type, list) {
  var i, numAsset;
  numAsset = data.length;
  for (i = 0; i < numAsset; ++i) {
    if (data[i].state === 'rejected') {
      delete this.battleData[type][list[i]];
    }
  }
};

BattleManager.prototype.setCombatState = function(numRetries) {
  return firebaseServices.setData(this.refs.map.child('inCombat'), this.refs.battleName, numRetries);
};

BattleManager.prototype.initPathingService = function(numRetries) {
  this.pathingService = new PathingService(this.refs.mapNode);
  return this.pathingService.init(numRetries);
};

BattleManager.prototype.pathfindingConfig = function() {
  var promise = this.pathingService.processInitData(this.battleData.count.total, this.initData.pc, this.initData.npc);
  this.emit('pathDataRequest');
  this.removeAllListeners('pathDataRequest');
  return promise;
};

BattleManager.prototype.targetConfig = function() {
  var i, numNpc, npcList;
  npcList = _.keys(this.npcs);
  numNpc = npcList.length;
  for (i = 0; i < numNpc; ++i) {
    this.targetService.registerNpc(this.npcs[npcList[i]]);
  }
};

BattleManager.prototype.initBattle = function() {

};

BattleManager.prototype.handleErrors = function(err) {
  if (err.message !== 'ReInit') {
    onError('Battle Manager Init Failed: ', err);
    this.destroyOwnRef();
    return false;
  } else {
    return true;
  }
};

BattleManager.prototype.addChar = function(pc) {
  if (!this.initData) {
    this.queues.pcInit.push(pc);
  } else {

  }
};

BattleManager.prototype.destroyOwnRef = function() {
  this.refs.map.child('inCombat')
    .set(false);
  this.removeAllListeners();
  this.selfRef.ref.destroyManager(this.selfRef.mapName, this.selfRef.row, this.selfRef.col);
};

// mob - {checks} threatTable skillQueue  movement: {intent}

// init threat tables
// init pcs - remove buff / debuffs from queue - run hook checks
// init npcs
// init pc vs npc checks
// init matrix / pathfinding
// init objects
// ready
// run npc progs


module.exports = BattleManager;