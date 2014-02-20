'use strict';

var _ = require('underscore');
var async = require('async');
var firebaseServices = require('./firebaseServices');
var firebaseRef = firebaseServices.firebaseRef;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Mobs = require('./mobGenerator');
var battleStates = {};

function init(locRef, battleId) {
  firebaseRef(['tempMapState', 'nodes', locRef.mapName, locRef.node[0], locRef.node[1]])
    .on('value', function() {
      var tasks = [];
      tasks.push(funcs);
      async.parallel(tasks,
        function(err, results){
          //npcs
          //pcs
          //matrix
          battleStates[battleId] = new BattleState(npcs, pcs, objects, matrix, battleId);
          battleStates[battleId].init();
        });

    });
}

var BattleState = function(npcs, pcs, objects, matrix, battleId) {
  this.pcs = pcs;
  this.npcs = npcs;
  this.objects = objects;
  this.grid = matrix;
  this.id = battleId;
  // mob - {checks} threatTable skillQueue  movement: {intent}
};

util.inherits(BattleState, EventEmitter);
BattleState.prototype.init = function() {
  var self = this;
  // init threat tables
  // init pcs - remove buff / debuffs from queue - run hook checks
  // init npcs
  // init pc vs npc checks
  // init matrix / pathfinding
  // init objects
    // ready
    // run npc progs
    firebaseRef(['battleStates', this.id])
      .on('child_added', battleStateListen);

};

BattleState.prototype.combat = function(skillId, user, target) {
  this.emit(skillId, target);
};

BattleState.prototype.movement = function(user, target) {
  // calc relative range all
  // follow logic
  this.emit(skillId, target);
};

function playerHealthEdit() {
  var health = 0;
  this.emit('health', health);
}

function battleStateListen(data) {

}

module.exports.init = init;
module.exports.battleStates = battleStates;