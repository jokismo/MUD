(function() {
  'use strict';

  angular.module('mudApp.auth')

    .service('waitForAuth', function($rootScope, $q, $timeout) {
      var def = $q.defer(), subs = [];
      function fn() {
        for(var i=0; i < subs.length; i++) { subs[i](); }
        $timeout(function() {
          // force $scope.$apply to be re-run after login resolves
          def.resolve();
        });
      }
      subs.push($rootScope.$on('$firebaseAuth:login', fn));
      subs.push($rootScope.$on('$firebaseAuth:logout', fn));
      subs.push($rootScope.$on('$firebaseAuth:error', fn));
      return def.promise;
    })

    .factory('loginService', ['$rootScope', '$firebaseAuth', 'firebaseRef', 'profileCreator', '$timeout', '$location',
      function($rootScope, $firebaseAuth, firebaseRef, profileCreator, $timeout, $location) {
        var auth = null;
        function assertAuth() {
          if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
        }
        return {
          init: function(path) {

            return auth = $firebaseAuth(firebaseRef(), {path: path});
          },

          /**
           * @param {string} email
           * @param {string} pass
           * @param {Function} [callback]
           * @returns {*}
           */
          login: function(email, pass, redirect, callback) {
            assertAuth();
            auth.$login('password', {
              email: email,
              password: pass,
              rememberMe: true
            }).then(function(user) {
                if( redirect ) {
                  $location.path(redirect);
                }
                callback && callback(null, user);
              }, callback);
          },

          logout: function(redirect) {
            assertAuth();
            auth.$logout();
            if( redirect ) {
              $location.path(redirect);
            }
          },

          changePassword: function(opts) {
            assertAuth();
            var cb = opts.callback || function() {};
            if( !opts.oldpass || !opts.newpass ) {
              $timeout(function(){ cb('Please enter a password'); });
            }
            else if( opts.newpass !== opts.confirm ) {
              $timeout(function() { cb('Passwords do not match'); });
            }
            else {
              auth.$changePassword(opts.email, opts.oldpass, opts.newpass, cb);
            }
          },

          createAccount: function(email, pass, callback) {
            assertAuth();
            auth.$createUser(email, pass, callback);
          },

          createProfile: profileCreator
        };

      }])

    .factory('profileCreator', ['firebaseRef', '$timeout', function(firebaseRef, $timeout) {
      return function(id, email, callback) {

        function firstPartOfEmail(email) {
          return ucfirst(email.substr(0, email.indexOf('@'))||'');
        }

        function ucfirst (str) {
          str += '';
          var f = str.charAt(0).toUpperCase();
          return f + str.substr(1);
        }

        firebaseRef('users/'+id).set({email: email, name: firstPartOfEmail(email)}, function(err) {
          //err && console.error(err);
          if( callback ) {
            $timeout(function() {
              callback(err);
            });
          }
        });

      };
    }]);

})();