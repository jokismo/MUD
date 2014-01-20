'use strict';

angular.module('mudApp.backendServices')

  .factory('presenceService', ['firebaseRef', 'Firebase', '$q', function(firebaseRef, Firebase, $q) {

    return {

      init: function(uid) {
        var deferred = $q.defer();
        this.uid = uid;
        this.checkAdmin(deferred);
        return deferred.promise;
      },

      userIsAuth: function() {
        var deferred = $q.defer();

        firebaseRef(['authCheck', 'normalAuth']).once('value', function() {
          deferred.resolve();
        }, function() {
          deferred.reject();
        });
        return deferred.promise;
      },

      checkAdmin: function(deferred) {
        firebaseRef(['authCheck', 'adminAuth']).once('value', function() {
          deferred.resolve(true);
        }, function() {
          deferred.resolve(false);
        });
      },

      setIp: function(uid, ip) {
        firebaseRef(['users', uid, 'ipList'])
          .push(ip);
      },

      charOnline: function(currentChar) {
        this.currentChar = currentChar;
        this.onlineChars = firebaseRef(['onlineChars', currentChar.charName]);
        var playTime = this.playTime = firebaseRef(['users', this.uid, 'houses', currentChar.factionId, currentChar.houseId, 'chars', currentChar.charId, 'playTime']);
        var newTime;

        this.onlineChars.set({
          loginTime: Firebase.ServerValue.TIMESTAMP,
          user: this.uid
        });
        this.onlineChars.onDisconnect().remove();

        playTime.once('value', function(data) {
          if (!data.hasChild('playTime')) {
            playTime.child('playTime').set(0, setLogin);
          } else {
            data = data.val();
            newTime = data.lastLogout - data.lastLogin + data.playTime;
            playTime.child('playTime').set(newTime, setLogin);
          }
        });
        playTime.child('lastLogout').onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

        function setLogin() {
          playTime.child('lastLogin').set(Firebase.ServerValue.TIMESTAMP);
        }
      },

      logout: function(callback) {
        var uid = this.uid;
        var onlineChars = this.onlineChars;

        if (this.playTime) {
          this.playTime.child('lastLogout').set(Firebase.ServerValue.TIMESTAMP, setCharStatus);
        } else {
          setLogout();
        }

        function setCharStatus() {
          onlineChars.remove(setLogout);
        }

        function setLogout() {
          firebaseRef(['users', uid, 'lastLogin'])
            .set(Firebase.ServerValue.TIMESTAMP, callback);
        }
      }

    };
  }]);
