'use strict';
var _ = require('underscore');
var mProg;
// get all mobs
var mobs = [];
// for all mobs, mobs.push new Mob(mobdata)

var Mob = function (mobdata) {
  this.id = mobdata.id;
  this.init = mobdata.init;
  this.states = mobdata.states;
};
Mob.prototype.init = function(battleState) {
  // for all checks, this.on(checkname, setvar)
};
Mob.prototype.changeState = function(battleState) {

};

function evalCond (cond, ref) {
  var length, i, bool, operator;
  if (_.isArray(cond)) {

  } else {
    length = cond.conds.length;
    operator = cond.cond;
    for (i = 0; i < length; ++i) {
      if (i === 0) {
        bool = evalCond(cond.conds[i]);
      } else {
        switch (operator) {
          case 'or':
            bool = bool || evalCond(cond.conds[i]);
            break;
          case 'and':
            bool = bool && evalCond(cond.conds[i]);
            break;
        }
      }
    }
  }
  return bool;
}

mProg = {
  id: '',
  threat: [],
  init: [
    {
      cond: 'or',
      conds: [['opp', 'faction', 'gt 40'], ['opp', 'faction', 'gt 60']],
      res: ['buff', 'ownstatmod', 'dex', 30]
    },
    {
      cond: 'and',
      conds: [{
        cond: 'or',
        conds: [['opp', 'faction', 'gt 40'], ['opp', 'faction', 'gt 60']]
      }, ['opp', 'faction', 'gt 60']],
      res: [['state', 1]] // else]
    },
    [['opp', 'num', 'gt 3', 30], ['skill','enrage']]
  ],
  states: [
    {
      id: 0,
      timers: [
        ['skill', 100, ['tarInRange', 1], 500, false, '!tarInRange'],
        {
          cond: ['rand', 50],
          res: [['skill', 400, false, true], ['skill', 200, false, true]],
          timer: 1500
        }
      ],
      triggers: [
        [['friend', 'reqassist'], 'target'],
        [{
          cond: 'and',
          conds: [['opp', 'hp', 'lt 40'], ['self', 'isLeader']],
          res: ['friends', 'reqassist']
        }],
        ['pathblocked', ['repath', 0]],
        ['!tarInRange', ['state', 2]],
        [['threatChange', 2], 'target']
      ]
    },{
      id: 1,
      timers: [

      ]
    }
  ]

};

module.exports = mobs;