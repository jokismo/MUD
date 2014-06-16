'use strict';

var firebaseServices = require('../firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var _ = require('underscore');
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;
var battleServerManager = {
  battleQueueRef: firebaseRef(['battleInitQueue']),
  tempMapDataRef: firebaseRef(['tempMapData']),
  maps: {},
  serverStatus: {},
  skipProcessList: {}
};

battleServerManager.init = function() {
  firebaseRef('battleServerDistribution')
    .once('value', quickBind(this.setServerDistribution, this), function(err) {
      onError('battleServerManager init Error: ', err);
    });
};

battleServerManager.setServerDistribution = function(serverList) {
  var serverNames, i, numServers, mapList, numMaps, j;
  serverList = serverList.val();
  serverNames = _.keys(serverList);
  numServers = serverNames.length;
  for (i = 0; i < numServers; ++i) {
    mapList = _.keys(serverList[serverNames[i]]);
    numMaps = mapList.length;
    for (j = 0; j < numMaps; ++j) {
      this.maps[mapList[j]] = {
        server: serverNames[i],
        ref: this.battleQueueRef.child(serverNames[i])
      };
      this.skipProcessList[mapList[j]] = {};
    }
  }
  this.initBattleServerWatch();
};

battleServerManager.initBattleServerWatch = function() {
  firebaseRef(['serverList', 'battleServers'])
    .on('value', quickBind(this.setServerStatus, this), function(err) {
      onError('initBattleServerWatch: ', err);
    });
};

battleServerManager.setServerStatus = function(serverList) {
  var serverNames, numServers, i;
  serverList = serverList.val();
  serverNames = _.keys(serverList);
  numServers = serverNames.length;
  for (i = 0; i < numServers; ++i) {
    this.serverStatus[serverNames[i]] = serverList[serverNames[i]].online;
  }
};

battleServerManager.initBattleQueue = function(npcId, groupId, charId, mapName, row, col) {
  var skipRef = this.skipProcessList[mapName];
  if (this.serverStatus[this.maps[mapName].name]) {
    this.tempMapDataRef.child(mapName).child('nodes').child(row).child(col).child('inCombat')
      .set('init', function(err) {
        update('initBattleQueue Error: ' + err);
      });
    this.maps[mapName].ref
      .push([npcId, charId, mapName, row, col, false], function(err) {
        if (err) {
          update('initBattleQueue Error: ' + err);
        } else {
          skipRef[groupId] = true;
        }
      });
  }
};

module.exports = battleServerManager;