'use strict';

angular.module('mudApp.adminView')

  .factory('npcService', ['firebaseBind', 'firebaseRef', '$q', function(firebaseBind, firebaseRef, $q) {

    return {

      getData: function(uid, mapName) {
        var returnData = {};
        var deferred = $q.defer();
        returnData.npcBind = firebaseBind(['users', uid, 'admin','tempMaps', mapName, 'npcList']);
        firebaseRef('classes').once('value', function(data) {
          returnData.classes = data.val();
          firebaseRef('factions').once('value', function(data) {
            returnData.factions = data.val();
            firebaseRef('races').once('value', function(data) {
              returnData.races = data.val();
              deferred.resolve(returnData);
            });
          });
        });
        return deferred.promise;
      }
    };
  }]);
