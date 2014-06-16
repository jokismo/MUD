'use strict';

var _ = require('underscore');
var Q = require('q');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var helpers = require('../helpers');
var quickBind = helpers.quickBind;
var onError = helpers.onError;
var update = helpers.update;

function Pc(pcId, pcData, pcRef, pathingService, managerRef) {
  this.id = pcId;
  this.group = {
    id: pcData[0]
  };
  this.pathData = pcData[1];
  this.aggroChecks = pcData[2];
  this.ref = pcRef.child(pcId);
  this.pathingService = pathingService;
  this.manager = managerRef;
  this.threat = {};
}

util.inherits(Pc, EventEmitter);

Pc.prototype.init = function() {
  return firebaseServices.getDataOnce(this.ref, 1)
    .then(quickBind(this.process, this));
};

Pc.prototype.process = function(pcData) {
  pcData = pcData.val();
  if (!this.validateInitData(pcData, 'stats')) {
    throw new Error('Pc ' + this.id + ' validate Stats Error.');
  }
  if (!this.validateInitData(pcData, 'aggro')) {
    throw new Error('Pc ' + this.id + ' validate Aggro Error.');
  }
  this.validateInitData(pcData, 'inv');
  this.manager.on('pathDataRequest', this.initPathing);
};

Pc.prototype.onPathDataRequest = function() {
  this.pathingService.initChar(this, 'pc');
};

Pc.prototype.validateInitData = function(data, prop) {
  if (!_.isUndefined(data[prop])) {
    this[prop] = data[prop];
    return true;
  } else {
    return false;
  }
};

module.exports = Pc;