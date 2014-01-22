'use strict';

angular.module('mudApp.mainView')

  .controller('HeaderCtrl', ['$scope', 'authService', '$location', 'uiSettingsService', function($scope, authService, $location, uiSettingsService) {

    $scope.showSettings = false;

    $scope.logout = function() {
      authService.logout();
    };

    $scope.settings = function() {
      $scope.showSettings = !$scope.showSettings;
    };

    $scope.saveSettings = function() {
      $scope.settings();
      uiSettingsService.saveSettings($scope.data.uiSettings);
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

    $scope.hideCurrentPage = function(path) {
      return $location.path() === path;
    };

    $scope.hide = function() {
      $scope.guiData.showHeader = false;
    };

  }]);