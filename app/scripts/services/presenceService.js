'use strict';

angular.module('mudApp.backendServices')

  .factory('presenceService', ['firebaseRef', 'Firebase', function(firebaseRef, Firebase) {

    return {

      isAuth: function(auth) {
        this.userAuth = auth;
      },

      init: function(uid) {
        this.uid = uid;
        this.isAuth(true);
      },

      setIp: function(uid, ip) {
        firebaseRef(['users', uid, 'ipList'])
          .push(ip);
        console.log(ip);
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
        this.isAuth(false);

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
