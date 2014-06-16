'use strict';

var _ = require('underscore'),
  Q = require('q'),
  firebaseServices = require('../firebaseServices'),
  firebaseRef = firebaseServices.firebaseRef,
  quickBind = require('../helpers').quickBind,
  evalConds = require('../helpers').evalConds,
  execService = {
    skillsRef: firebaseRef('skills')
  };

execService.init = function() {
  return firebaseServices.getDataOnce(execService.skillsRef, 2)
    .then(function(data) {
      execService.skillsList = data.val();
    });
};

execService.skill = function(skillData, target) {
  var skill;
  skill = execService.skillsList[skillData.id.cat][skillData.id.subCat][skillData.id.id];
  if (!target) {
    if (skillData.target) {
      if (skillData.target === 'self') {
        target = this;
      } else {
        target = this.targetService[skillData.evalTarget[0]](this, skill.range, skillData.evalTarget[1]);
        if (!target) {
          return false;
        }
      }
    }
  }
  if (skillData.cond) {
    if (execService.evalAction.call(this, skillData.cond)) {

    } else if (skillData.else) {
      execService[skillData.else[0]].call(this, skillData.else[1]);
    }
  }
  this.queueAction({
    exec: 'execSkill',
    skill: skill,
    target: target
  });
};

execService.evalAction = function(cond) {
  if (evalConds(cond, this)) {
    return true;
  } else if (cond.else) {
    execService[cond.else[0]].call(this, cond.else[1]);
  }
  return false;
};