'use strict';

angular.module('mudApp.auth')

  .controller('LoginCtrl', ['$scope', 'authService', '$route', '$resource', function($scope, authService, $route, $resource) {

    $scope.login = {};
    $scope.newUser = {};
    $scope.data.uiSettings = {};
    $scope.data.currentChar = {};

    $scope.logIn = function(login, pass) {
      authService.login(login, pass, ip.ip);
    };

    $scope.createUser = function() {
      if ($scope.newUser.pass === $scope.newUser.passConfirm) {
        authService.createAccount($scope.newUser.email, $scope.newUser.pass)
          .then(function() {
            authService.createProfile($scope.newUser.email, $scope.auth.user.id);
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

  }]);