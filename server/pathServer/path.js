'use strict';

var _ = require('underscore');
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;
var randNumZero = helpers.randNumZero;
var battleServerManager = require('./battleServerManager');

function Path(pathData, asyncCallback, tempMapDataRef, pathWatchersRef) {
  this.pathData = pathData.val();
  this.groupId = pathData.name();
  this.selfRef = pathData.ref();
  this.callback = asyncCallback;
  this.mapName = this.pathData[3];
  this.mapRef = tempMapDataRef.child(this.mapName).child('nodes');
  this.pathWatchersRef = pathWatchersRef;
  this.currentPos = [];
  this.newPos = [];
  this.saveData = {
    nodeData: {
      npcIds: {}
    },
    self: {}
  };
}

Path.prototype.update = function() {
  var currentPosRef = this.mapRef.child(this.currentPos[0])
    .child(this.currentPos[1]).child('idleNpcList').child(1);
  currentPosRef.transaction(quickBind(this.checkCurrentRef, this), quickBind(this.afterTransaction, this));
};

Path.prototype.checkCurrentRef = function(currentData) {
  var npcIds, i, length;
  npcIds = _.keys(this.saveData.nodeData.npcIds);
  currentData = currentData.val();
  if (!_.isUndefined(currentData[npcIds[0]])) {
    length = npcIds.length;
    for (i = 0; i < length; ++i) {
      if (!_.isUndefined(currentData[npcIds[i]])) {
        currentData[npcIds[i]] = null;
      } else {
        return;
      }
    }
    this.save();
    return currentData;
  }
  return;
};

Path.prototype.save = function() {
  var self = this;
  var newPosRef = this.mapRef.child(this.newPos[0])
    .child(this.newPos[1]).child('idleNpcList').child(1);
  newPosRef
    .update(this.saveData.nodeData.npcIds, function(err) {
      if (err) {
        update(self.groupId + ' newPos update Error: ' + err);
      } else {
        self.checkForPcs();
      }
    });
  this.selfRef.update(this.saveData.self, function(err) {
    if (err) {
      update(self.groupId + ' Path update Error: ' + err);
    }
  });
};

Path.prototype.checkForPcs = function() {
  this.mapRef.child(this.newPos[0])
    .child(this.newPos[1]).child('idlePcList')
    .once('value', quickBind(this.checkAggro, this), function(err) {
      update('checkForPcs Error: ' + err);
    });
};

Path.prototype.checkAggro = function(nodeData) {
  var val, nodeSize, nodeRef, pcList, pcIds, npcIds, aggroTypes, numAggroCheck, numPc, numNpc, mapRow, mapCol, i, j, k;
  nodeRef = nodeData.ref();
  val = nodeData.val();
  nodeSize = val[0];
  pcList = val[1];
  pcIds = _.keys(pcList);
  numPc = pcList.length;
  npcIds = this.saveData.nodeData.npcIds;
  aggroTypes = npcIds[1][0];
  numAggroCheck = aggroTypes.length;
  npcIds = _.keys(npcIds);
  numNpc = npcIds.length;
  for (i = 0; i < numPc; ++i) {
    for (j = 0; j < numNpc; ++j) {
      for (k = 0; k < numAggroCheck; ++k) {
        if (!_.isUndefined(this.pathWatchersRef[pcIds[i]].aggroCheck)) {
          if (isAggro(aggroTypes[k], nodeSize, this.pathWatchersRef[pcIds[i]].aggroCheck)) {
            mapRow = nodeRef.parent().parent().name();
            mapCol = nodeRef.parent().parent().parent().name();
            battleServerManager.initBattleQueue(npcIds[i], this.groupId, pcIds[i], this.mapName, mapRow, mapCol);
            return;
          }
        } else {
          update('Error getting aggroCheck data for ' + pcIds[i] + ' on Map ' + this.mapName);
        }
      }
    }
  }
};

Path.prototype.afterTransaction = function(err, wasCommitted) {
  if (err) {
    update(this.groupId + ' currentPos update Error: ' + err);
  } else if (!wasCommitted) {
    // ADD TO ERRORCHECK QUEUE
  }
  this.callback();
};

Path.prototype.process = function() {
  var pathType, pathInfo, pathArray, paths, multiData, length, forkPool, randFork, direcsArray;
  var pathData = this.pathData;
  if (_.isUndefined(battleServerManager.skipProcessList[this.mapName][this.groupId])) {
    this.saveData.self.posIndex = pathData[0];
    paths = pathData[1];
    this.saveData.nodeData.npcIds = pathData[2];
    if (!_.isUndefined(pathData[4])) {
      multiData = pathData[4];
      this.saveData.self.multiData = {};
      this.saveData.self.multiData.arrayIndex = multiData.arrayIndex;
      pathInfo = paths[this.saveData.self.multiData.arrayIndex];
      forkPool = multiData.pool;
    } else {
      pathInfo = paths;
    }
    pathType = pathInfo[0];
    pathArray = pathInfo[1];
    this.currentPos = pathArray[this.saveData.self.posIndex];
    length = this.currentPos.length;
    if (length > 2) {
      length =  forkPool[this.currentPos[2]].length;
      randFork = forkPool[this.currentPos[2]][randNumZero(length - 1)];
      this.saveData.self.multiData.arrayIndex = randFork[0];
      this.saveData.self.posIndex = randFork[1];
      pathInfo = paths[this.saveData.self.multiData.arrayIndex];
      pathType = pathInfo[0];
      pathArray = pathInfo[1];
    }
    switch(pathType) {
      case 0:
        this.saveData.self.posIndex++;
        this.newPos = pathArray[this.saveData.self.posIndex];
        break;
      case 1:
        direcsArray = [0, 1, 1, 1, 1];
        if (direcsArray[randNumZero(5)] === 0) {
          this.saveData.self.posIndex--;
        } else {
          this.saveData.self.posIndex++;
        }
        this.newPos = pathArray[this.saveData.self.posIndex];
        break;
      default:
        update('pathType case Error: GroupId ' + this.groupId);
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