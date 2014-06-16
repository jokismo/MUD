'use strict';

var _ = require('underscore');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;
var battleServerManager = require('./battleServerManager');

function PathWatcher(charId, mapName, charsRef, tempMapDataRef) {
  this.id = charId;
  this.aggroCheck = [];
  this.pathRef = charsRef.child(charId).child('currentLoc');
  this.aggroProcessRef = firebaseRef(['aggroChecks']);
  this.tempMapDataRef = tempMapDataRef;
  this.mapName = mapName;
}

PathWatcher.prototype.observe = function() {
  this.pathRef
    .on('value', quickBind(this.process, this), function(err) {
      update('watchPath Error: ' + err);
    });
};

PathWatcher.prototype.remove = function() {
  this.pathRef.off('value');
};

PathWatcher.prototype.process = function(locData) {
  locData = locData.val();
  if (locData.length > 1) {
    if (locData[1] === 0) { // 0 = uninit
      return;
    } else if (locData[1] === 1) { // 1 = getAggro
      this.getAggroData();
    } else if (locData[1] === 2) { // new map
      this.requestAggroData(locData);
    }
  } else {
    this.initAggroCheck(locData);
  }
};

PathWatcher.prototype.getAggroData = function() {
  this.aggroProcessRef.child('get').child(this.id)
    .once('value', quickBind(this.setAggroCheck, this), function(err) {
      update('getAggroData Error: ' + err);
    });
};

PathWatcher.prototype.setAggroCheck = function(aggroCheck) {
  var val = aggroCheck.val();
  this.aggroCheck = val.aggroCheck;
};

PathWatcher.prototype.requestAggroData = function(locData) {
  this.aggroProcessRef.child('process')
    .push([this.id, locData], function(err) {
      if (err) {
        update('requestAggroData Error: ' + err);
      }
    });
};

PathWatcher.prototype.initAggroCheck = function(locData) {
  this.tempMapDataRef.child(this.mapName).child('nodes').child(locData[0]).child(locData[1]).child('idleNpcList')
    .once('value', quickBind(this.checkAggro, this), function(err) {
      update('initAggroCheck Error: ' + err);
    });
};

PathWatcher.prototype.checkAggro = function(nodeData) {
  var val, nodeSize, nodeRef, npcList, npcIds, aggroTypes, numNpc, numAggroCheck, mapRow, mapCol, groupId, i, j;
  nodeRef = nodeData.ref();
  val = nodeData.val();
  nodeSize = val[0];
  npcList = val[1];
  npcIds = _.keys(npcList);
  numNpc = npcIds.length;
  for (i = 0; i < numNpc; ++i) {
    aggroTypes = npcList[npcIds[i]][1];
    groupId = npcList[npcIds[i]][0];
    numAggroCheck = aggroTypes.length;
    for (j = 0; j < numAggroCheck; ++j) {
      if (isAggro(aggroTypes[j], nodeSize, this.aggroCheck)) {
        mapRow = nodeRef.parent().parent().name();
        mapCol = nodeRef.parent().parent().parent().name();
        battleServerManager.initBattleQueue(npcIds[i], groupId, this.id, this.mapName, mapRow, mapCol);
        return;
      }
    }
  }
};

function isAggro(aggroData, nodeSize, aggroCheck) {
  var aggro = false;
  var nodeRatio = 64 / nodeSize;
  if (aggroCheck[0][aggroData[0]]) {
    if (aggroCheck[1][aggroData[1]] * nodeRatio > 0) {
      aggro = true;
    }
  } else {
    aggro = false;
  }
  return aggro;
}