'use strict';
var cond, resultFunc, mProg, conditions;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MyClass = function() {
};
util.inherits(MyClass, EventEmitter);
MyClass.prototype.emitter = function() {
  this.emit("custom event", "argument 1", "argument 2");
};

function mobGen() {
  return {

  };
}
mProg = {
  id: '',
  init: [],
  movement: [
    [[{
      target: 'self, opp, friendly',
      variable: '',
      cond: ''
    }, resultFunc], {
      rand: true,
      cond: 'and',
      conds: [],
      resultFunc: ''
    }, [cond, resultFunc]]
  ],
  battle: {

  }
};
conditions = [

]