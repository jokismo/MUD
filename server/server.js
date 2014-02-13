'use strict';

var cp = require('child_process');
var serverList = [{
  desc: 'Battle Server',
  path: '/battleServer.js'
  },
  {
    desc: 'Battle Server 2',
    path: '/battleServer.js'
  }];
var idList = {};
var i;

for (i = 0; i < serverList.length; ++i) {
  var proc;
  proc = cp.fork(__dirname + serverList[i].path);
  proc.on('error', serverError)
    .on('exit', serverExit);
  idList[proc.pid] = {
    serverId: i
  };
  serverList[i].process = proc;
}

function serverError(error) {
  console.log(error);
}

function serverExit(code) {
  if (code === null) {
    restartServer(this.pid);
  }
}

function restartServer(pid) {
  var proc, id;
  id = idList[pid].serverId;
  proc = cp.fork(__dirname + serverList[id].path);
  proc.on('error', serverError)
    .on('exit', serverExit);
  idList[proc.pid] = {
    serverId: id
  };
}