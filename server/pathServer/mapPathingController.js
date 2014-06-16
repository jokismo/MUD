'use strict';

var firebaseServices = require('../firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var _ = require('underscore');
var PathWatcher = require('./pathWatcher');
var TimedPathGroup = require('./timedPathGroup');
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;

function PathingController (mapName) {
  this.mapName = mapName;
  this.skipProcessList = {};
  this.pathWatchers = {};
  this.activeCharsRef = firebaseRef(['activeCharsByMap']);
  this.pathTimesRef = firebaseRef(['pathTimes']);
  this.pathsRef = firebaseRef(['paths']);
  this.tempMapDataRef = firebaseRef(['tempMapData']);
  this.initPathWatch();
  this.initPathQueue();
}

PathingController.prototype.initPathWatch = function() {
  this.activeCharsRef.child(this.mapName)
    .on('child_added', quickBind(this.watchPath, this), function(err) {
      onError('initPathWatch Error: ', err);
    });
  this.activeCharsRef.child(this.mapName)
    .on('child_removed', quickBind(this.unWatchPath, this), function(err) {
      onError('initPathWatch Error: ', err);
    });
};

PathingController.prototype.watchPath = function(charData) {  // process aggro
  var val = charData.val();
  var mapName = this.mapName;
  this.pathWatchers[val.id] = new PathWatcher(val.id, mapName, this.activeCharsRef, this.tempMapDataRef);
  this.pathWatchers[val.id].observe();
};

PathingController.prototype.unWatchPath = function(charData) {
  var val = charData.val();
  if (!_.isUndefined(this.pathWatchers[val.id])) {
    this.pathWatchers[val.id].remove();
    this.pathWatchers[val.id] = null;
  }
};

PathingController.prototype.initPathQueue = function() {
  this.pathTimesRef
    .on('child_added', quickBind(this.initTimedPathGroup, this), function(err) {
      onError('processPathQueue Error: ', err);
    });
};

PathingController.prototype.initTimedPathGroup = function(time) {
  var group;
  time = time.val();
  group = new TimedPathGroup(time, this.mapName, this.pathsRef, this.tempMapDataRef, this.pathWatchers);
  group.process();
};

module.exports = PathingController;