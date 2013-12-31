'use strict';

angular.module('mudApp.auth')

  .controller('LoginCtrl', ['$scope', 'loginService', function($scope, loginService) {

    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function(callback) {
      $scope.err = null;
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass ) {
        $scope.err = 'Please enter a password';
      }
      else {
        loginService.login($scope.email, $scope.pass,'/', function(err, user) {
          $scope.err = err? err + '' : null;
          typeof(callback) === 'function' && callback(err, user);
        });
      }
    };

    $scope.createAccount = function() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      else {
        loginService.createAccount($scope.email, $scope.pass, function(err, user) {
          if( err ) {
            $scope.err = err? err + '' : null;
          }
          else {
            $scope.login(function(err) {
              if( !err ) {
                loginService.createProfile(user.uid, user.email);
              }
            });
          }
        });
      }
    };
  }]);