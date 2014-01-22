'use strict';

angular.module('mudApp.backendServices')

  .factory('usersService', ['firebaseRef', 'Firebase', '$timeout', '$q', function(firebaseRef, Firebase, $timeout, $q) {

    return {

      newAdmin: function(uid, isSuper) {
        var adminRef = firebaseRef(['admins', uid]);
        var deferred = $q.defer();

        adminRef.transaction(function(currentData) {
          if (currentData === null) {
            return { superAdmin: isSuper };
          } else {
            deferred.notify(true);
            return { superAdmin: isSuper };
          }
        }, function(error, committed) {
          if (committed && !error) {
            deferred.resolve();
          }
          if (error) {
            deferred.reject(error);
          }
        });

        return deferred.promise;
      }

    };

  }]);
