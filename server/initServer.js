'use strict';

var _ = require('underscore');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var serverName;

firebaseServices.auth
  .then(function() {
    serverOnline();
    initBattleQueue();
  }, function(err) {
    console.log(err);
  });

process.on('message', function(data) {
  serverName = data;
});

function serverOnline() {
  var serverRef = firebaseRef(['serverList', 'battleServers', serverName]);
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

function initBattleQueue() {
  firebaseRef(['serverList', serverName, 'battleInitQueue'])
    .on('child_added', function(data) {
      data.ref().remove();
      // data has mapname, nodes
      // set battle state on node
      // get temp node state
      BattleState.init(data.val(), battleId);
    });
}