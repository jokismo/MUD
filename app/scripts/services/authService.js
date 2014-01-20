(function() {
  'use strict';

  angular.module('mudApp.auth')

    .factory('authService', ['$rootScope', '$firebaseSimpleLogin', 'firebaseRef', '$timeout', '$location', 'presenceService',
      function($rootScope, $firebaseSimpleLogin, firebaseRef,  $timeout, $location, presenceService) {
        var auth;
        return {
          init: function() {
            return auth = $firebaseSimpleLogin(firebaseRef());
          },

          login: function(email, pass, ip) {
            auth.$login('password', {
              email: email,
              password: pass,
              rememberMe: true
            }).then(function(user) {
                if(ip) {
                  presenceService.setIp(user.id, ip);
                }
              });
          },

          logout: function() {
            presenceService.logout(function() {
              auth.$logout();
            });
          },

          createAccount: function(email, pass) {
            return auth.$createUser(email, pass);
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