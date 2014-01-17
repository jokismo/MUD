'use strict';

angular.module('mudApp.auth')

  .controller('LoginCtrl', ['$scope', 'loginService', '$route', function($scope, loginService) {

    $scope.login = {};
    $scope.newUser = {};

    $scope.logIn = function(login, pass) {
      loginService.login(login, pass);
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
  }]);