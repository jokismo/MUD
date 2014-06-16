'use strict';

var async = require('async');
var Path = require('./path');
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var update = helpers.update;

function TimedPathGroup(time, mapName, pathsRef, tempMapDataRef, pathWatchersRef) { // possible memory leak?
  this.mapName = mapName;
  this.time = time.val();
  this.pathsRef = pathsRef.child(mapName).child(time.toString());
  this.tempMapDataRef = tempMapDataRef;
  this.queue = async.queue(quickBind(this.processPath, this));
  this.queue.drain = update('TimedPathGroup ' + this.mapName + ' ' + this.time + ' processing complete');
  this.pathWatchersRef = pathWatchersRef;
}

TimedPathGroup.prototype.process = function() {
  this.pathsRef.off('child_added');
  this.pathsRef
    .on('child_added', quickBind(this.pushPathData, this), function(err) {
      update('TimedPathGroup Error: ' + err);
    });
  setTimeout(quickBind(this.process, this), this.time);
};

TimedPathGroup.prototype.pushPathData = function(pathData) {
  this.queue.push(pathData, function(err) {
    if (err) {
      update(err);
    }
  });
};

TimedPathGroup.prototype.processPath = function(pathData, asyncCallback) {
  var pathWatchersRef = this.pathWatchersRef;
  var tempMapDataRef = this.tempMapDataRef;
  var path;
  path = new Path(pathData, asyncCallback, tempMapDataRef, pathWatchersRef);
  path.process();
  path.update();
};