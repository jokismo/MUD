'use strict';

var Firebase = require('firebase'),
_ = require('underscore'),
Q = require('q'),
quickBind = require('../helpers').quickBind,
services = {},
FirebaseTokenGenerator = require('firebase-token-generator'),
firebaseRootRef = new Firebase('https://jokismo.firebaseio.com/'),
tokenGenerator = new FirebaseTokenGenerator('FTHF4J22wsnxOQwqMq2PsoPdCtGdTbEqEzCGSXAv'),
token = tokenGenerator.createToken(
  {id: 'server'},
  {admin: true,
    expires: 1580565825}
);

services.auth = function() {
  var deferred = Q.defer();
  firebaseRootRef.auth(token, function(error) {
    if(error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};

services.firebaseRef = function() {
  return new Firebase(pathRef(['https://jokismo.firebaseio.com/'].concat(Array.prototype.slice.call(arguments))));
};

services.getDataOnce = function(ref, numRetries, deferred) {
  var failFunc;
  var returnPromise = !deferred;
  if (returnPromise) {
    deferred = Q.defer();
  }
  if (_.isUndefined(numRetries)) {
    numRetries = 0;
  }
  if (numRetries > 0) {
    failFunc = function() {
      services.getDataOnce(ref, --numRetries, deferred);
    };
  } else {
    failFunc = function() {
      deferred.reject();
    };
  }
  ref.once('value', deferred.resolve, failFunc);
  if (returnPromise) {
    return deferred.promise;
  }
};

services.setData = function(ref, data, numRetries, deferred) {
  var returnPromise = !deferred;
  if (returnPromise) {
    deferred = Q.defer();
  }
  if (_.isUndefined(numRetries)) {
    numRetries = 0;
  }
  ref.set(data, function(err) {
    if (err) {
      if (numRetries > 0) {
        services.setData(ref, data, --numRetries, deferred);
      } else {
        deferred.reject(err);
      }
    } else {
      deferred.resolve();
    }
  });
  if (returnPromise) {
    return deferred.promise;
  }
};

function pathRef(args) {
  for(var i=0; i < args.length; i++) {
    if( typeof(args[i]) === 'object' ) {
      args[i] = pathRef(args[i]);
    }
  }
  return args.join('/');
}

module.exports = services;
