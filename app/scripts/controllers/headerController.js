'use strict';

angular.module('mudApp.mainView')

  .controller('HeaderCtrl', ['$scope', 'loginService', function($scope, loginService) {

    $scope.showSettings = false;
    $scope.data.uiSettings.editing = false;
    $scope.data.uiSettings.showHeader = true;
    $scope.data.uiSettings.header = 'headerOn';

    $scope.columnOptions = [1,2,3];

    $scope.logout = function() {
      loginService.logout();
    };

    $scope.settings = function() {
      $scope.showSettings = !$scope.showSettings;
      $scope.data.uiSettings.editing = !$scope.data.uiSettings.editing;
    };

    $scope.saveSettings = function() {
      $scope.settings();
      $scope.data.uiSettings.$save();
    };

    $scope.hide = function() {
      $scope.data.uiSettings.showHeader = false;
      $scope.data.uiSettings.header = '';
    };

  }]);