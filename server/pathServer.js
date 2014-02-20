'use strict';

var _ = require('underscore'),
  Q = require('q');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var battleServers = {
  num: -1,
  servers: []
};
var serverName;

firebaseServices.auth
  .then(function() {
    serverOnline();
    initPathQueue();
    battleServersStatus(initAggroWatch);
  }, function(err) {
    console.log(err);
  });

process.on('message', function(data) {
  serverName = data;
});

function serverOnline() {
  var serverRef = firebaseRef(['serverList', serverName]);
  var connectedRef = firebaseRef('.info/connected');
  connectedRef.on('value', function(data) {
    if (data.val() === true) {
      serverRef.update({online: true});
      serverRef.onDisconnect().update({online: false});
      console.log(serverName + ' is Connected');
    } else {
      console.log(serverName + ' disconnected from Firebase');
    }
  });
}

// normal paths
// if mob aggros or flees - // flee path or aggro path

// uninit mob list
// generate mobs with all rand info -> path or no path


function initPathQueue() {
  firebaseRef(['npcList', 'moving'])
    .on('child_added', function(data) {

    });
}

function processPathQueue() {
  firebaseRef(['serverList', 'serverName', 'initPathQueue'])
    .on('child_added', function(data) {

    });
}

function battleServersStatus(callback) {
  firebaseRef(['serverList', 'battleServers'])
    .on('value', function(data) {
      battleServers = {
        num: -1,
        servers: []
      };
      var val = data.val();
      var keys = _.keys(val);
      var i;
      for (i = 0; i < keys.length; ++i) {
        if (val[keys[i]].online) {
          battleServers.num++;
          battleServers.servers.push(firebaseRef(['serverList', 'battleServers', keys[i], 'battleInitQueue']));
        }
      }
      if (callback) {
        callback();
      }
    });
}

function initAggroWatch() {
  firebaseRef(['charLocs'])
    .on('child_added', function(data) {
      var val = data.val();
      // [charLvl, locArray, charId]
      firebaseRef(['mapStates', val[1][0], 'nodes', val[1][1], val[1][2], 'idleNpcList'])
        .once('value', function(innerData) {
          // [mapLvl, nodeSize, npcList]
          var innerVal = innerData.val();
          var length = innerVal[2].length, i;
          for (i = 0; i < length; ++i) {
            if (isAggro(val[0], innerVal[0], innerVal[1]) > 50) {
              initBattleQueue(val, innerVal[2][i]);
              break;
            }
          }
          data.ref().remove();
        });
    });
}

function initBattleQueue(nodeData, npcId) {
  battleServers.servers[randNumZero(battleServers.num)]
    .push([nodeData[1][0], nodeData[1][1], nodeData[1][2], nodeData[2], npcId]);
}

function isAggro(lvl, mapLvl, nodeSize) {
  var nodeRatio = 64 / nodeSize;
  var lvlRatio = mapLvl / lvl;
  return nodeRatio * lvlRatio * randNum(100);
}

function randNum(num) {
  return 1 + Math.random() * num | 0;
}

function randNumZero(num) {
  return Math.random() * num | 0;
}