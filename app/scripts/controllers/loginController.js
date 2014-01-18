'use strict';

angular.module('mudApp.auth')

  .controller('LoginCtrl', ['$scope', 'loginService', '$route', '$resource', 'firebaseRef', function($scope, loginService, $route, $resource, firebaseRef) {

    $scope.login = {};
    $scope.newUser = {};
    $scope.data.uiSettings = {};
    $scope.data.currentChar = {};

    $scope.logIn = function(login, pass) {
      loginService.login(login, pass, ip.ip);
    };

    $scope.createUser = function() {
      if ($scope.newUser.pass === $scope.newUser.passConfirm) {
        var promise = loginService.createAccount($scope.newUser.email, $scope.newUser.pass);
        promise.then(function() {
          loginService.createProfile($scope.newUser.email, $scope.auth.user.id);
        }, function(err) {
          console.log(err);
        });
      }
    };

    var ip = {
      ip : ''
    };
    var ipGet = $resource('http://api.hostip.info/get_json.php');
    ip = ipGet.get();

    firebaseRef('authCheck').once('value', function() {
      console.log('auth');
    }, function(err) {
      console.log('err');
    })
  }]);