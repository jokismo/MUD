'use strict';

var _ = require('underscore');
var Q = require('q');
var firebaseServices = require('../firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var BattleManager = require('./battleManager');
var mobLogicService = require('./mobGenerator');
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;

function BattleStateController(serverName) {
  this.battleStates = {};
  this.serverName = serverName;
  this.serverRef = firebaseRef(['battleServerDistribution', this.serverName]);
  this.battleQueueRef = firebaseRef(['battleInitQueue', serverName]);
  this.activeBattleRef = firebaseRef(['activeBattles', serverName]);
  this.mapRef = firebaseRef('maps');
  this.tempMapRef = firebaseRef('tempMapData');
  this.activeCharsRef = firebaseRef('activeCharsByMap');
  this.npcRef = firebaseRef('activeNpcs');
  this.pcRef = firebaseRef('chars');
  this.objRef = firebaseRef('objects');
}

BattleStateController.prototype.init = function() {
  var self = this;
  firebaseServices.getDataOnce(this.serverRef, 2)
    .then(quickBind(this.setMapList, this))
    .then(mobLogicService.init)
    .then(quickBind(this.initBattleQueueWatch, this))
    .catch(quickBind(this.handleErrors, this))
    .done(function(err) {
      if (!err) {
        update(self.serverName + ' Init Complete.');
      }
    });
};

BattleStateController.prototype.setMapList = function(mapList) {
  var numMaps, i, numRows, j;
  mapList = mapList.val();
  this.mapList = _.keys(mapList);
  numMaps = this.mapList.length;
  for (i = 0; i < numMaps; ++i) {
    this.battleStates[this.mapList[i]] = [];
    numRows = mapList[i];
    for (j = 0; j < numRows; ++j) {
      this.battleStates[this.mapList[i]][j] = [];
    }
  }
  return this.mapList;
};

BattleStateController.prototype.initBattleQueueWatch = function() {  // npcId, charId, mapName, row, col, initByPc
  this.battleQueueRef.on('child_added', quickBind(this.processBattleQueue, this), function(err) {
    onError('BattleQueueWatch disconnected: ', err);
  });
};

BattleStateController.prototype.processBattleQueue = function(queueData) {
  var initByPc, mapName, npcId, charId, row, col;
  queueData = queueData.val();
  npcId = queueData[0];
  charId = queueData[1];
  mapName = queueData[2];
  row = queueData[3];
  col = queueData[4];
  initByPc = queueData[5];
  if (!this.battleStates[mapName][row][col]) {
    this.battleStates[mapName][row][col] = new BattleManager(mapName, row, col, npcId, charId,
      this.mapRef, this.tempMapRef, this.activeCharsRef, this.npcRef, this.pcRef, this.activeBattleRef,
      this.objRef, this);
    this.battleStates[mapName][row][col].init();
  }
  else if (initByPc) {
    this.battleStates[mapName][row][col].addChar(npcId);
  }
};

BattleStateController.prototype.handleErrors = function() {

};

BattleStateController.prototype.destroyManager = function(mapName, row, col) {
  this.battleStates[mapName][row][col] = null;
};

module.exports = BattleStateController;