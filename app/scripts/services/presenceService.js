'use strict';

angular.module('mudApp.backendServices')

  .service('presenceService', ['firebaseRef', 'Firebase', function(firebaseRef, Firebase) {

    return {

      init: function(uid) {
        this.uid = uid;
      },

      userLogging: function(uid) {
        var userConnections = firebaseRef(['users', uid, 'connections']);
        var lastOnlineRef = firebaseRef(['users', uid, 'lastOnline']);
        var connectedRef = firebaseRef('.info/connected');


        connectedRef.once('value', function(snap) {
          if (snap.val() === true) {

            var currentConnection = userConnections.push(true);

            currentConnection.onDisconnect().remove();

            lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
          }
        });
      },

      charOnline: function(currentChar) {
        this.currentChar = currentChar;
        var onlineChars = firebaseRef(['onlineChars', this.currentChar.charName]);
        var lastOnlineRef = firebaseRef(['users', uid, 'lastOnline']);

      },

      logout: function (callback) {
        firebaseRef(['users', this.uid, 'lastLogin'])
          .set(Firebase.ServerValue.TIMESTAMP, callback);
      },

      charLogging: function(uid) {

      }

    };
  }]);
