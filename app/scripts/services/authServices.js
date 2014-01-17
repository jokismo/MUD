(function() {
  'use strict';

  angular.module('mudApp.auth')

    .factory('loginService', ['$rootScope', '$firebaseSimpleLogin', 'firebaseRef', '$timeout', '$location', 'presenceService',
      function($rootScope, $firebaseSimpleLogin, firebaseRef,  $timeout, $location, presenceService) {
        var auth;
        return {
          init: function() {
            return auth = $firebaseSimpleLogin(firebaseRef());
          },

          login: function(email, pass) {
            auth.$login('password', {
              email: email,
              password: pass,
              rememberMe: true
            }).then(function() {
                $location.path('/');
              });
          },

          logout: function() {
            presenceService.logout(function() {
              auth.$logout();
            });
          },

          createAccount: function(email, pass, callback) {
            var promise = auth.$createUser(email, pass);
            return promise;
          },

          createProfile: function(email, uid) {
            var userRef = firebaseRef(['users', uid]);
            userRef.set({
              email: email
            }, function(err) {
              if(err) {
                console.log(err);
              } else {
                $location.path('/');
              }
            });
          }
        };

      }]);

})();