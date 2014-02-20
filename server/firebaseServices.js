'use strict';

var Firebase = require('firebase'),
  Q = require('q'),
  FirebaseTokenGenerator = require("firebase-token-generator"),
  firebaseRootRef = new Firebase('https://jokismo.firebaseio.com/'),
  tokenGenerator = new FirebaseTokenGenerator('FTHF4J22wsnxOQwqMq2PsoPdCtGdTbEqEzCGSXAv'),
  token = tokenGenerator.createToken(
    {id: 'server'},
    {admin: true,
      expires: 1580565825}
  ),
  deferred = Q.defer();

firebaseRootRef.auth(token, function(error) {
  if(error) {
    deferred.reject(error);
  } else {
    deferred.resolve();
  }
});

function pathRef(args) {
  for(var i=0; i < args.length; i++) {
    if( typeof(args[i]) === 'object' ) {
      args[i] = pathRef(args[i]);
    }
  }
  return args.join('/');
}

function firebaseRef() {
  return new Firebase(pathRef(['https://jokismo.firebaseio.com/'].concat(Array.prototype.slice.call(arguments))));
}

module.exports.auth = deferred.promise;
module.exports.firebaseRef = firebaseRef;