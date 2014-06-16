'use strict';

var _ = require('underscore');
var firebaseServices = require('../firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var BattleStateController = require('./battleStateController');
var helpers = require('../helpers');
var onError = helpers.onError;
var update = helpers.update;
var serverName, server, battleStateController;

firebaseServices.auth()
  .then(function() {
    server = new BattleServer(serverName);
    server.init();
    battleStateController = new BattleStateController(serverName);
    battleStateController.init();
  }, function(err) {
    onError(serverName + 'Auth Error: ', err);
  });

process.on('message', function(data) {
  serverName = data;
});

function BattleServer(serverName) {
  this.name = serverName;
}

BattleServer.prototype.init = function() {
  var connectedRef = firebaseRef('.info/connected');
  connectedRef.on('value', managePresence);
};

function managePresence(data) {
  var serverRef = firebaseRef(['serverList', serverName]);
  if (data.val() === true) {
    serverRef.update({online: true});
    serverRef.onDisconnect().update({online: false});
    update(serverName + ' is Connected');
  } else {
    onError('Firebase Error: ', serverName + ' disconnected from Firebase');
  }
}