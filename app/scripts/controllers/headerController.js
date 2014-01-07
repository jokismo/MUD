'use strict';

angular.module('mudApp.mainView')

  .controller('HeaderCtrl', ['$scope', 'loginService', function($scope, loginService) {

    $scope.showSettings = false;

    $scope.data.uiSettings.header = {
      showHeader : true
    };

    $scope.logout = function() {
      loginService.logout();
    };

    $scope.settings = function() {
      $scope.showSettings = !$scope.showSettings;
    };

    $scope.saveSettings = function() {
      $scope.settings();
      $scope.data.uiSettings.$save();
    };

    $scope.toggleDrag = function() {
      $scope.data.uiSettings.guisettings.draggable = !$scope.data.uiSettings.guisettings.draggable;
    };

    $scope.toggleResize = function() {
      $scope.data.uiSettings.guisettings.resizable = !$scope.data.uiSettings.guisettings.resizable;
    };

    $scope.toggleSnap = function() {
      $scope.data.uiSettings.guisettings.snap = !$scope.data.uiSettings.guisettings.snap;
    };

    $scope.hide = function() {
      $scope.data.uiSettings.header.showHeader = false;
    };

  }]);