'use strict';

var _ = require('underscore');

var helpers = {
  quickBind: function(func, context, argArray) {
    return function() {
      if (argArray) {
        Array.prototype.push.apply(arguments, argArray);
      }
      return func.apply(context, arguments);
    };
  },
  randNumZero: function(num) {
    return Math.random() * num | 0;
  },
  randNum: function(num) {
    return (Math.random() * num | 0) + 1;
  },
  onError: function(text, error, callback) {
    console.error(text + ' ' + error);
    if (callback) {
      callback();
    }
  },
  update: function(text) {
    console.log(text);
  },
  randFromArray: function(array) {
    return array[helpers.randNumZero(array.length)];
  },
  BinaryHeap: BinaryHeap,
  evalCheck: evalCheck
};

function evalCheck (cond, ref, results) {
  if (evalConds(cond, ref)) {
    results.push(cond.res);
  } else if (cond.else) {
    evalCheck (cond.else, ref, results);
  }
}

function evalConds (cond, ref) {
  var length, i, bool, operator;
  if (!cond.cond) {
    bool = evalCond(cond.conds, ref);
  } else {
    length = cond.conds.length;
    operator = cond.cond;
    for (i = 0; i < length; ++i) {
      if (i === 0) {
        bool = evalCond(cond.conds[i], ref);
      } else {
        switch (operator) {
          case 'or':
            bool = bool || evalCond(cond.conds[i], ref);
            break;
          case 'and':
            bool = bool && evalCond(cond.conds[i], ref);
            break;
        }
      }
    }
  }
  return bool;
}

function evalCond (cond, ref) {
  var data, bool;
  data = ref[cond[0]];
  switch (cond[1]) {
    case '=':
      bool = (data === cond[2]);
      break;
    case '>':
      bool = (data > cond[2]);
      break;
    case '<':
      bool = (data < cond[2]);
      break;
    case 'ex':
      bool = (!_.isUndefined(data));
      break;
    case 'rand':
      bool = (helpers.randNum(100) < cond[2]);
      break;
    case 'eval':
      bool = evalCond(cond[2], [data()]);
      break;
    case 'nav':
      bool = evalCond(cond[2], ref[cond[0]]);
      break;
  }
  return bool;
}

function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    this.content.push(element);
    this.bubbleUp(this.content.length - 1);
  },
  pop: function() {
    var result = this.content[0];
    var end = this.content.pop();
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },
  remove: function(node) {
    var change;
    var i = this.content.indexOf(node);
    if (i !== -1) {
      var length = this.content.length - 1;
      var end = this.content.pop();
      if (i !== length) {
        this.content[i] = end;
        change = this.bubbleUp(i);
        this.sinkDown(i - change);
      }
    }
  },
  size: function() {
    return this.content.length;
  },
  rescoreElement: function(node) {
    var change;
    var index = this.content.indexOf(node);
    if (index !== -1) {
      change = this.bubbleUp(index);
      this.sinkDown(index - change);
    }
  },
  bubbleUp: function(n) {
    var count = 0;
    var element = this.content[n];
    var score = this.scoreFunction(element);
    while (n > 0) {
      var parentN = ((n + 1) >> 1) - 1,
        parent = this.content[parentN];
      if (score < this.scoreFunction(parent)) {
        count++;
        this.content[parentN] = element;
        this.content[n] = parent;
        n = parentN;
      }
      else {
        break;
      }
    }
    return count;
  },
  sinkDown: function(n) {
    var length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);
    while(true) {
      var child2N = (n + 1) << 1, child1N = child2N - 1;
      var swap = null;
      var child1Score;
      if (child1N < length) {
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        if (child1Score < elemScore){
          swap = child1N;
        }
      }
      if (child2N < length) {
        var child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      else {
        break;
      }
    }
  }
};

module.exports = helpers;