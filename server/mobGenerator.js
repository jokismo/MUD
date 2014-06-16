'use strict';

var _ = require('underscore'),
  Q = require('q'),
  firebaseServices = require('./firebaseServices'),
  firebaseRef = firebaseServices.firebaseRef,
  quickBind = require('../helpers').quickBind,
  mobLogicService = {
    ref: firebaseRef('mobLogic'),
    logicList: [],
    mapList: {}
  };

mobLogicService.init = function(mapList) {
  Q.all([firebaseServices.getDataOnce(mobLogicService.ref, 2),
      getMapLists(mapList)])
    .then(processInitData);
};

function getMapLists(mapList) {
  var i, numMaps, tasks;
  var ref = firebaseRef(['mobLogicByMap']);
  tasks = [];
  numMaps = mapList.length;
  for (i = 0; i < numMaps; ++i) {
    tasks.push(firebaseServices.getDataOnce(ref.child(mapList[i]), 2));
  }
  return Q.all(tasks)
    .then(function(data) {
      return {
        data: data,
        num: numMaps
      };
    });
}

function processInitData(dataArray) {
  var i, j, mapData, mapName, logicList, numLogic, tempList, tempCompList;
  var allLogic = dataArray[0].val();
  var numMaps = dataArray[1].num;
  tempList = [];
  for (i = 0; i < numMaps; ++i) {
    mapData = dataArray[1].data[i].val();
    tempList.push.apply(tempList, mapData.list);
  }
  tempList.logicList = _.uniq(tempList);
  tempCompList = {};
  for (i = 0; i < tempList.length; ++i) {
    tempCompList[tempList[i]] = i;
    mobLogicService.logicList.push(allLogic[tempList[i]]);
  }
  for (i = 0; i < numMaps; ++i) {
    mapData = dataArray[1].data[i].val();
    mapName = mapData.name;
    logicList = mapData.list;
    numLogic = logicList.length;
    mobLogicService.mapList[mapName] = {};
    for (j = 0; j < numLogic; ++j) {
      mobLogicService.mapList[mapName][logicList[j]] = tempCompList[logicList[j]];
    }
  }
}

mobLogicService.getMobLogic = function(logicNum, mapName) {
  var logic, index;
  var self = mobLogicService;
  var deferred = Q.defer();
  if (!_.isUndefined(self.mapList[mapName][logicNum])) {
    logic = self.logicList[self.mapList[mapName][logicNum]];
    deferred.resolve(new Mob(logic));
  } else {
    firebaseServices.getDataOnce(self.ref.child('list').child(logicNum), 2)
      .then(function(data) {
        index = self.logicList.length;
        self.mapList[mapName][logicNum] = self.logicList.length;
        self.logicList.push(data);
        deferred.resolve(new Mob(self.logicList[index]));
      })
      .catch(function() {
        deferred.reject(new Error('Init Error: No Mob Logic Module Found: ' + logicNum));
      })
      .done();
  }
  return deferred.promise;
};

var Mob = function (logic) {
  this.logic = logic;

};

Mob.prototype.init = function() {
  this.currentState = this.logic.states[0];
// check all pc in threat table for triggers
// init timers
// register triggers
};

Mob.prototype.getNumInitChecks = function() {
  return {
    all: this.logic.init.length,
    pc: this.logic.init.pc.length,
    self: this.logic.init.self.length
  };
};

Mob.prototype.launchState = function() {

};

Mob.prototype.changeState = function(battleState) {

};

var skill = {
  type: 'damage',
  options: [],
  gcd: 1000,
  conds: {}
};

var mProg = {
  id: '',
  threat: [],
  init: {
    pc: [
      {
        cond: 'or',
        conds: [['inv', 'nav', ['eq', 'nav', [203, 'ex']]], ['faction', 'gt 60']], //pointer to data
        res: ['buff', 'ownstatmod', 'dex', 30]
      },
      {
        cond: 'and',
        conds: [{
          cond: 'or',
          conds: [['faction', 'gt 40'], ['faction', 'gt 60']]
        }, ['faction', 'gt 60']],
        res: ['state', 1], // else]
        else: {}
      }
    ],
    self: [
      [['threat', 'nav', ['table', 'nav', ['size', 'eval', [0, 'gt', 3]]]], ['skill', {
        id: {
          cat: 0,
          subCat: 5,
          id: 100
        },
        vari: {
          type: 'dex',
          num: 30
        },
        cond: [
          ['isTarget', 'eval', [0, 'gt', 3], null] // vars in array after cond
        ],
        target: 'self',
        evalTarget: ['', 'vari'] // melee target, ld target, re-eval if oor?
    // range groups
  }]]
]
},
states: [
  {
    id: 0,
    actions: [{
      id: {
        cat: 0,
        subCat: 5,
        id: 100
      },
      cond: {
        conds: ['size', 'eval', [0, 'gt', 3]],
        else: ['skill', {}]
      }

    }
    ],
    triggers: [
      [['friend', 'reqassist'], 'target'],
      [{
        cond: 'and',
        conds: [['opp', 'hp', 'lt 40'], ['self', 'leader', true]],
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

module.exports = mobLogicService;