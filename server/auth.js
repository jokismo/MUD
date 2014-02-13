'use strict';

var Firebase = require('firebase'),
  Q = require('q'),
  FirebaseTokenGenerator = require("firebase-token-generator"),
  myRootRef = new Firebase('https://jokismo.firebaseio.com/'),
  tokenGenerator = new FirebaseTokenGenerator('FTHF4J22wsnxOQwqMq2PsoPdCtGdTbEqEzCGSXAv'),
  token = tokenGenerator.createToken(
    {id: 'server'},
    {admin: true}
  ),
  deferred = Q.defer();

myRootRef.auth(token, function(error) {
  if(error) {
    deferred.reject(error);
  } else {
    deferred.resolve();
    myRootRef.child('Server Online').set(true);
    myRootRef.child('Server Online').onDisconnect().set(false);
  }
});

module.exports = deferred.promise;