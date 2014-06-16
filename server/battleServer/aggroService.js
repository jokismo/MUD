'use strict';

var _ = require('underscore');

function AggroService() {
  this.pc = [];
  this.npc = [];
}

AggroService.prototype.process = function(npcsRef, type, data) {
  var pcList, npcList, i, j, k, numChecks, numPc, numNpc, aggroList, npcChecks, pcChecks;
  pcList = this.pc;
  npcList = this.npc;
  if (type === 'pc') {
    pcList = [data];
    this.pc.push(data);
  }
  if (type === 'npc') {
    npcList = [data];
    this.npc.push(data);
  }
  numPc = pcList.length;
  numNpc = npcList.length;
  for (i = 0; i < numNpc; ++i) {
    aggroList = npcsRef[npcList[i].id].threat.list;
    npcChecks = npcList[i].checks;
    numChecks = npcChecks.length;
    for (j = 0; j < numPc; ++j) {
      pcChecks = pcList[j].checks;
      for (k = 0; k < numChecks; ++k) {
        if (pcChecks[0][npcChecks[k]]) {
          aggroList.push(pcList[j].id);
          break;
        }
      }
    }
  }
};

module.exports = AggroService;