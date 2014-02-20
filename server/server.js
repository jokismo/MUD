'use strict';

var cp = require('child_process'),
  Q = require('q');
var serverList = [{
  desc: 'Battle Server',
  path: '/battleServer.js'
  },
  {
    desc: 'Battle Server 2',
    path: '/battleServer.js'
  },
  {
    desc: 'Path Server',
    path: '/pathServer.js'
  }];
var idList = {};
var i, deferred = Q.defer();

// Clean database before tasks

function launchInitServer() {
  var proc;
  proc = cp.fork(__dirname + 'initServer.js');
  proc.send('Init Server');
  proc.on('message', function(data) {
    if (data === 'complete') {
      proc.kill();
    }
  })
    .on('exit', function(code, signal) {
      if (signal === 'SIGTERM') {
        deferred.resolve();
      }
    });
}

function startServer(id) {
  var proc;
  proc = cp.fork(__dirname + serverList[id].path);
  proc.on('error', serverError)
    .on('exit', serverExit);
  proc.send(serverList[id].desc);
  idList[proc.pid] = {
    serverId: id
  };
}

function serverError(error) {
  console.log(error);
}

function serverExit(code) {
  console.log(serverList[idList[this.pid].serverId].desc + ' has disconnected');
  if (code === null) {
    restartServer(this.pid);
  }
}

function restartServer(pid) {
  var id;
  id = idList[pid].serverId;
  startServer(id);
}

launchInitServer();
deferred.promise
  .then(function() {
    for (i = 0; i < serverList.length; ++i) {
      startServer(i);
    }
  }, function(err) {
    console.log(err);
  });