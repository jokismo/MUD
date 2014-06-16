'use strict';

var _ = require('underscore'),
  Q = require('q'),
  firebaseServices = require('../firebaseServices'),
  firebaseRef = firebaseServices.firebaseRef,
  quickBind = require('../helpers').quickBind,
  targetService = {};

targetService.registerNpc = function(npcRef) {
  var distances, threatTable, pcList, numPc, i, distance;
  distances = npcRef.distances;
  threatTable = npcRef.threat.table;
  if (threatTable.size > 0) {
    pcList = _.keys(threatTable.content);
    numPc = pcList.length;
    for (i = 0; i < numPc; ++i) {
      distance = normalizeDistance(distances[pcList[i]]);
      setDist(npcRef, distance, pcList[i]);
    }
  }
};

targetService.highestThreatInRange = function(npcRef, range) {
  var numPc, i, pcRef, pcId, newDistance;
  numPc = npcRef.threat.table.size;
  if (numPc > 0) {
    for (i = 0; i < numPc; ++i) {
      pcRef = npcRef.threat.table.content[i];
      pcId = pcRef.id;
      if (!npcRef.targeting.group[range][pcId]) {
        newDistance = normalizeDistance(npcRef.pathingService.updateDistance(pcRef, npcRef));
        delete npcRef.targeting.group[range][pcId];
        setDist(npcRef, newDistance, pcId);
      }
      if (npcRef.targeting.ind[pcId] <= range) {
        return pcRef;
      }
    }
  }
  return false;
};

function normalizeDistance(dist) {
  return dist / 10 | 0;
}

function setDist(npcRef, dist, pcId) {
  if (!npcRef.targeting.group[dist]) {
    npcRef.targeting.group[dist] = {};
  }
  npcRef.targeting.group[dist][pcId] = true;
  npcRef.targeting.ind[pcId] = dist;
}

module.exports = targetService;