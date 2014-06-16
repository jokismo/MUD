'use strict';

var _ = require('underscore');
var Q = require('q');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var mobLogicService = require('./mobGenerator');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;

function Obj(objId, objData, objRef, pathingService, managerRef) {
  this.id = objId;
  this.ref = objRef.child(objId);
  this.pathingService = pathingService;
  this.manager = managerRef;
}

util.inherits(Obj, EventEmitter);

Obj.prototype.init = function() {
  return firebaseServices.getDataOnce(this.ref, 1)
    .then(quickBind(this.process, this));
};

Obj.prototype.process = function(objData) {
  objData = objData.val();
  if (!this.validateInitData(objData, 'stats')) {
    throw new Error('Pc ' + this.id + ' validate Stats Error.');
  }
  if (!this.validateInitData(objData, 'props')) {
    throw new Error('Pc ' + this.id + ' validate Props Error.');
  }
  this.validateInitData(objData, 'timers');
  this.validateInitData(objData, 'triggers');
  this.validateInitData(objData, 'inv');
  this.manager.on('pathDataRequest', this.onPathDataRequest);
};

Obj.prototype.onPathDataRequest = function() {
  this.pathingService.initObj(this.id, this.stats);
};

Obj.prototype.validateInitData = function(data, prop) {
  if (!_.isUndefined(data[prop])) {
    this[prop] = data[prop];
    return true;
  } else {
    return false;
  }
};

module.exports = Obj;