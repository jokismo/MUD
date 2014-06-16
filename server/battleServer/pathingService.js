'use strict';

var _ = require('underscore'),
  Q = require('q'),
  firebaseServices = require('../firebaseServices'),
  AStarSearch = require('./pathFinding'),
  AggroService = require('./aggroService'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  quickBind = require('../helpers').quickBind,
  onError = require('../helpers').onError,
  update = require('../helpers').update,
  randFromArray = require('../helpers').randFromArray;

function PathingService(nodeRef) {
  this.nodeRef = nodeRef;
  this.objects = {};
  this.pc = {};
  this.npc = {};
  this.groups = {};
  this.roomData = {};
  this.aggroService = new AggroService();
}

util.inherits(PathingService, EventEmitter);

PathingService.prototype.init = function(numRetries) {
  return firebaseServices.getDataOnce(this.nodeRef, numRetries)
    .then(quickBind(this.initGrid, this));
};

PathingService.prototype.initGrid = function(nodeData) {
  nodeData = nodeData.val();
  this.roomData.rows = nodeData.rows;
  this.roomData.cols = nodeData.cols;
  this.roomData.exits = nodeData.exits;
  this.pathFinding = new AStarSearch(nodeData.roomMap, 10);
  this.pathFinding.init();
};

PathingService.prototype.processInitData = function(assetCount, initPc, initNpc) {
  return this.deferAction(assetCount)
    .then(quickBind(this.aggroService.process, this.aggroService, [this.npc, 'init']))
    .then(quickBind(this.initChars, this, [initPc, initNpc]));
};

PathingService.prototype.deferAction = function(numActions) {
  var deferred = Q.defer();
  this.asyncActionComplete = _.after(numActions, deferred.resolve);
  setTimeout(quickBind(deferred.reject, null, [new Error('Timeout on Pathing Assets Load')]), 5000);
};

PathingService.prototype.initChars = function(initPc, initNpc) {
  var pcList, npcList, initPcRef, initNpcRef, numNpc, numPc, i, j, tempThreat, pcRef, npcRef, pcId, threatSet;
  pcList = _.keys(this.pc);
  npcList = _.keys(this.npc);
  if (initNpc !== null && this.pc[initPc]) {
    initPcRef = this.pc[initPc];
    initPcRef.pos = this.getRandPathPos(initPc, 'pc');
    initPcRef.group.pos = initPcRef.pos;
    pcList.splice(pcList.indexOf(initPc), 1);
    if (this.npc[initNpc]) {
      initNpcRef = this.npc[initNpc];
      initNpcRef.pos = this.pathFinding.processInitPos(initPcRef.pos, 4);
      initNpcRef.group.pos = initNpcRef.pos;
      initThreat(initPcRef, initNpcRef);
      npcList.splice(npcList.indexOf(initNpc), 1);
      tempThreat = {};
      tempThreat[initNpcRef.group.id] = initPcRef;
    }
  }
  numPc = pcList.length;
  for (i = 0; i < numPc; ++i) {
    this.initCharPos(pcList[i], 'pc');
  }
  numNpc = npcList.length;
  for (i = 0; i < numNpc; ++i) {
    threatSet = false;
    npcRef = this.npc[npcList[i]];
    this.initCharPos(npcList[i], 'npc');
    if (tempThreat[[npcRef].group.id]) {
      pcRef = tempThreat[npcRef.group.id];
      initThreat(pcRef, npcRef);
      threatSet = true;
    }
    for (j = 0; j < numPc; ++j) {
      pcId = pcList[j];
      npcRef.distances[pcId] = this.pathFinding.getDistance(npcRef.loc, this.pc[pcId].loc);
      if (!threatSet && npcRef.threat.list[pcId] && npcRef.distances[pcId] < npcRef.aggroRange) {
        initThreat(this.pc[pcId], npcRef);
        threatSet = true;
      }
    }
  }
};

function initThreat(pcRef, npcRef) {
  pcRef.threat[npcRef.id] = 1;
  npcRef.threat.table.push(pcRef);
}

PathingService.prototype.initCharPos = function(id, type) {
  var asset;
  asset = this[type][id];
  if (asset.group.length > 1 && asset.group.pos) {
    asset.pos = this.pathFinding.processInitPos(asset.group.pos, 4);
  } else {
    asset.pos = this.getRandPathPos(id, type);
    asset.group.pos = asset.pos;
  }
};

PathingService.prototype.getRandPathPos = function(id, type) {
  var asset, start, exit, end, exits, path, pos;
  asset = this[type][id];
  start = this.getRandEntryNode(asset.path[0]);
  if (asset.path[1]) {
    exit = asset.path[1];
  } else {
    exits = _.keys(this.exits);
    if (exits.length > 1) {
      exit = getRandExit(exits, asset.path[0]);
    } else {
      pos = this.pathFinding.processInitPos(start, 3);
      if (!pos) {
        return start;
      } else {
        return pos;
      }
    }
  }
  end = this.getRandEntryNode(exit);
  path = this.pathFinding.search(start, end, {
    diagonal: false,
    heuristic: 'manhattan'
  });
  if (path.length > 0) {
    pos = this.pathFinding.processInitPos(randFromArray(path), false);
  } else {
    pos = this.pathFinding.processInitPos(start, 3);
  }
  if (!pos) {
    return start;
  } else {
    return pos;
  }
};

function getRandExit(exits, entry) {
  var exit = randFromArray(exits);
  if (exit === entry) {
    exit = getRandExit(exits, entry);
  }
  return exit;
}

PathingService.prototype.getRandEntryNode = function(entrance) {
  return randFromArray(this.exits[entrance].nodes);
};

PathingService.prototype.initObj = function(id, objStats) {
  this.objects[id] = objStats;
  this.placeObj(objStats);
};

PathingService.prototype.placeObj = function(objStats) {
  var i, objNodes, posArray;
  if (objStats.pos) {
    posArray = objStats.pos.pos;
    objNodes = posArray.length;
    for (i = 0; i < objNodes; ++i) {
      this.pathFinding.grid[posArray[i][0]][posArray[i][1]].z += objStats.stats.z;
    }
  }
  this.asyncActionComplete();
};

PathingService.prototype.initChar = function(charRef, type) {
  if (!this.groups[charRef.group.id]) {
    this.groups[charRef.group.id] = [];
  }
  this.groups[charRef.group.id].push(charRef.id);
  charRef.group.group = this.groups[charRef.group.id];
  this[type][charRef.id] = charRef;
  this.aggroService[type].push({
    id: charRef.id,
    checks: charRef.aggroChecks
  });
  this.asyncActionComplete();
};

PathingService.prototype.updateDistance = function(pcRef, npcRef) {
  npcRef.distances[pcRef.id] = this.pathFinding.getDistance(npcRef.loc, pcRef.loc);
  return npcRef.distances[pcRef.id];
};

module.exports = PathingService;