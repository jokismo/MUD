'use strict';

var serverName, server;
var firebaseServices = require('../firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var mapPathingController = require('./mapPathingController');
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;


process.on('message', function(data) {
  serverName = data;
});

firebaseServices.auth()
  .then(function() {
    server = new PathServer(serverName);
    server.init();
    server.battleServerManager = require('./battleServerManager');
    server.battleServerManager.init();
    server.initPathTasks();
  }, function(err) {
    onError(serverName + 'Auth Error: ', err);
  });

function PathServer(name) {
  this.name = name;
  this.mapList = firebaseRef(['pathServerDistribution', name]);
  this.pathingControllers = {};
}

PathServer.prototype.init = function() {
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

PathServer.prototype.initPathTasks = function() {
  this.mapList
    .on('child_added', quickBind(this.processTasks, this), function(err) {
      onError('initPathTasks Error: ', err);
    });
};

PathServer.prototype.processTasks = function(mapName) {
  mapName = mapName.name();
  this.pathingControllers[mapName] = new mapPathingController(mapName);
};