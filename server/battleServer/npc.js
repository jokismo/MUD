'use strict';

var _ = require('underscore'),
  Q = require('q'),
  firebaseServices = require('../firebaseServices'),
  firebaseRef = firebaseServices.firebaseRef,
  mobLogicService = require('./mobGenerator'),
  execService = require('./execService'),
  stateMachineService = require('../stateMachine'),
  helpers = require('../helpers'),
  evalCheck = helpers.evalCheck,
  quickBind = helpers.quickBind,
  onError = helpers.onError,
  update = helpers.update,
  BinaryHeap = require('../helpers').BinaryHeap;

function Npc(npcId, npcData, managerRef) {
  this.id = npcId;
  this.group = {
    id: npcData[0]
  };
  this.distances = {};
  this.targeting = {
    group: {},
    ind: {}
  };
  this.aggroChecks = npcData[1];
  this.pathData = npcData[2];
  this.ref = managerRef.refs.npcs.child(npcId).child(1);
  this.pathingService = managerRef.pathingService;
  this.manager = managerRef;
  this.threat = {
    table: new BinaryHeap(function(pc) {
      return -pc.threat[npcId];
    }),
    list: []
  };
  this.queue = {
    lastSync: 0,
    active: false,
    queue: new BinaryHeap(function(action) {
      return action.delay;
    })
  };
  this.mapName = managerRef.selfRef.mapName;
}

Npc.prototype.init = function() {
  return firebaseServices.getDataOnce(this.ref, 1)
    .then(quickBind(this.process, this))
    .then(quickBind(this.registerLogic, this))
    .then(quickBind(this.bindListeners, this));
};

Npc.prototype.process = function(npcData) {
  npcData = npcData.val();
  if (!this.validateInitData(npcData, 'stats')) {
    throw new Error('Npc ' + this.id + ' validate Stats Error.');
  }
  if (!this.validateInitData(npcData, 'combatModule')) {
    throw new Error('Npc ' + this.id + ' validate CombatModule Error.');
  }
  this.validateInitData(npcData, 'props');
  this.validateInitData(npcData, 'itemSkills');
  this.validateInitData(npcData, 'groupPos');
  this.validateInitData(npcData, 'aggroRange');
  this.validateInitData(npcData, 'inv');
  this.validateInitData(npcData, 'repopLink');
  return this.combatModule;
};

Npc.prototype.registerLogic = function(logicNum) {
  var self = this;
  return mobLogicService.getMobLogic(logicNum, this.mapName)
    .then(function(mob) {
      self.mobLogic = mob;
    });
};

Npc.prototype.bindListeners = function() {
  this.manager.on('pathDataRequest', this.onPathDataRequest);
  this.manager.on('initBattle', this._eInit);
  this.pathingService.on(this.group.id, quickBind(this.onGroupDataFromPathing, this));
  this.pathingService.on(this.id, quickBind(this.onDataFromPathing, this));
};

Npc.prototype.onGroupDataFromPathing = function(type, data) {
  switch (type) {
    case 'threat':
      f();
      break;
    case 'move':
      f();
      break;
  }
};

Npc.prototype.onPathDataRequest = function() {
  this.pathingService.initChar(this, 'npc');
};

Npc.prototype.validateInitData = function(data, prop) {
  if (!_.isUndefined(data[prop])) {
    this[prop] = data[prop];
    return true;
  } else {
    return false;
  }
};

stateMachineService.create({
  target: Npc.prototype,
  events: [
    {name: '_eInit', from: 'none', to: '_sOoc'},
    {name: '_eCombat', from: '_sOoc', to: '_sCombat'},
    {name: '_eCast', from: '_sCombat', to: '_sCasting'}
  ]});

Npc.prototype.on_eInit = function() {
  if (this.threat.table.size > 0) {
    this._eCombat();
  }
};

Npc.prototype.on_eCombat = function() {
  var i, passed, numChecks;
  if (!this.mobLogic.currentState) {
    this.mobLogic.init();
  }
  numChecks = this.logic.getNumInitChecks();
  if (numChecks.all > 0) {
    if (numChecks.self > 0) {
      passed = this.checkConditions(this, this.mobLogic.logic.init.self);
      this.execTasks(passed);
    }
    if (numChecks.pc > 0) {
      for (i = 0; i < this.threat.table.size; ++i) {
        passed = this.checkConditions(this.threat.table.content[i], this.mobLogic.logic.init.pc);
        this.execTasks(passed);
      }
    }
  }
};

Npc.prototype.checkConditions = function(ref, conds) {
  var i, numConds, results;
  numConds = conds.length;
  results = [];
  for (i = 0; i < numConds; ++i) {
    evalCheck(conds[i], this);
  }
  return results;
};

Npc.prototype.execTasks = function(tasks) {
  var i, numTasks;
  numTasks = tasks.length;
  for (i = 0; i < numTasks; ++i) {
    this.execTask(tasks[i]);
  }
};

Npc.prototype.execTask = function(task) {
  execService[task[0]].call(this, task[1]);
};

Npc.prototype.queueAction = function(action) {
  var timeNow;
  timeNow = Date.now();
  if (!this.queue.active) {
    this.queue.queue.push(action);
    this.queue.lastSync = timeNow;
  } else {
    this.reSyncQueue(timeNow);
    this.queue.queue.push(action);
    if (this.queue.queue.content[0] === action) {
      this.reTimerQueue();
    }
  }
};

Npc.prototype.reSyncQueue = function(time) {
  var numItems, i, timeDiff;
  timeDiff = time - this.queue.lastSync;
  numItems = this.queue.queue.size;
  for (i = 0; i < numItems; ++i) {
    this.queue.queue.content[i].delay -= timeDiff;
  }
  this.queue.lastSync = time;
};

Npc.prototype.reTimerQueue = function() {
  clearTimeout(this.queue.active);
  this.execQueue();
};

Npc.prototype.execQueue = function() {
  var self = this;
  var action = this.queue.queue.content[0];
  this.queue.active = setTimeout(function() {
    self.execQueueAction();
  }, action.delay);
};

Npc.prototype.execQueueAction = function() {
  var timeNow, action, tempArray, length, i;
  timeNow = Date.now();
  this.reSyncQueue(timeNow);
  action = this.queue.queue.pop();
  if (this.queue.queue.content[0] && this.queue.queue.content[0].delay < 1000) {
    tempArray = [];
    action = this.checkQueuePriority(tempArray, action);
    length = tempArray.length;
    if (length > 0) {
      for (i = 0; i < length; ++i) {
        this.queue.queue.push(tempArray[i]);
      }
    }
  }
  execService[action.exec](action);
  this.execQueue();
};

Npc.prototype.checkQueuePriority = function(array, action) {
  var newAction, returnVal;
  if (action.priority > this.queue.queue.content[0].priority) {
    array.push(action);
    newAction = this.queue.queue.pop();
    if (this.queue.queue.content[0] && this.queue.queue.content[0].delay < 1000) {
      returnVal = this.checkQueuePriority(array, newAction);
    } else {
      returnVal = action;
    }
  }
  return returnVal;
};

module.exports = Npc;