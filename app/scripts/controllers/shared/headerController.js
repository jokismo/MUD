'use strict';

angular.module('mudApp.mainView')

  .controller('HeaderCtrl', ['$scope', 'authService', '$location', function($scope, authService, $location) {

    $scope.showSettings = false;

    $scope.logout = function() {
      authService.logout();
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

    $scope.hideCurrentPage = function(page) {
      if ($location.path() === page) {
        return true;
      } else {
        return false;
      }
    };

    $scope.hide = function() {
      $scope.guiData.showHeader = false;
    };

  }]);