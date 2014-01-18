'use strict';

angular.module('mudApp.backendServices')

  .factory('charService', ['firebaseRef', 'Firebase', '$timeout', '$q', function(firebaseRef, Firebase, $timeout, $q) {

    return {

      newHouse: function(houseData, uid) {
        var houseRef = firebaseRef(['users', uid, 'houses', houseData.factionId]);
        var houseDbRef = firebaseRef(['houses', houseData.factionId]);
        var houseNameRef = firebaseRef(['housesByName', houseData.name]);
        var houseId = "";
        var deferred = $q.defer();
        var populateHouse = this.populateHouse;

        houseDbRef = houseDbRef.push({
          user: uid,
          name: houseData.name
        }, checkName);

        function checkName() {
          houseId = houseDbRef.name();
          deferred.notify('Checking for Duplicate Name');
          houseNameRef.transaction(function(currentData) {
            if (currentData === null) {
              return { id: houseId };
            } else {
              houseDbRef.remove();
              deferred.reject(houseData.name + ' is taken.');
            }
          }, function(error, committed) {
            if (committed && !error) {
              deferred.notify('Populating House');
              houseRef.child(houseId).set({
                factionName: houseData.faction,
                name: houseData.name
              });
              populateHouse(houseId, houseData.name, uid, houseRef, deferred);
            }
          });
        }

        return deferred.promise;
      },

      populateHouse: function(houseId, houseName, uid, houseRef, deferred) {
        var newDbRef = [],
          i,
          charId = [],
          charRef = houseRef.child(houseId + '/chars');
        var charDbRef = firebaseRef('chars');
        var firstNames = [
          'Peter',
          'John',
          'Mike',
          'Sam'
        ];
        var lastNames = [
          'Smith',
          'Adams',
          'Jones',
          'Obama'
        ];
        var chars = [{}, {}, {}];
        var statNames = ['con', 'dex', 'vit', 'int', 'agi'];
        var stats = {};

        function random(x) {
          return Math.random() * x | 0;
        }

        for (i = 0; i < 3; i++) {
          chars[i].firstName = firstNames[random(3)];
          chars[i].lastName = lastNames[random(3)];
          statNames.forEach(function(element) {
            stats[element] = random(20);
          });
          chars[i].stats = JSON.parse(JSON.stringify(stats));
          chars[i].user = uid;
          chars[i].houseId = houseId;
          chars[i].houseName = houseName;
          chars[i].nick = 'notSet';
          newDbRef[i] = charDbRef.push(chars[i]);
          charId[i] = newDbRef[i].name();
        }

        saveChars();

        function saveChars() {
          chars.forEach(function(element, index) {
            charRef.child(charId[index]).set({
              firstName: chars[index].firstName,
              lastName: chars[index].lastName,
              nick: 'notSet',
              stats: chars[index].stats
            });
          });
          deferred.resolve();
        }

      },

      createNick: function(uid, factionId, houseId, charId, nick) {
        var charRef = firebaseRef(['users', uid, 'houses', factionId, houseId, 'chars', charId]);
        var charDbRef = firebaseRef(['chars', charId]);
        var charNameRef = firebaseRef(['charsByName', nick]);
        var deferred = $q.defer();

        charNameRef.transaction(function(currentData) {
          if (currentData === null) {
            return { id: charId };
          } else {
            deferred.reject(nick + ' is taken.');
          }
        }, function(error, committed) {
          if (committed && !error) {
            deferred.notify(deferred);
            charRef.child('nick').set(nick);
            charDbRef.child('nick').set(nick);
          }
        });
        return deferred.promise;
      }

    };

  }]);
