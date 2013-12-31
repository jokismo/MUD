'use strict';

angular.module('mudApp.mainView')

  .controller('HeaderCtrl', ['$scope', 'loginService', function($scope, loginService) {

    $scope.showSettings = false;
    $scope.columnOptions = [1,2,3];

    $scope.logout = function() {
      loginService.logout('/login');
    };

    $scope.settings = function() {
      $scope.showSettings = !$scope.showSettings;
    };

    $scope.saveSettings = function() {
      $scope.data.uiSettings.$save();
    };

  }]);