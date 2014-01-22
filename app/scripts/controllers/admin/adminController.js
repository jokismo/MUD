'use strict';

angular.module('mudApp.adminView')

  .controller('AdminCtrl', ['$scope', 'uiSettingsService', function($scope, uiSettingsService) {

    $scope.guiData = {};

    Mousetrap.bind('esc', showHeader);

    function showHeader() {
      $scope.$apply(function() {
        $scope.guiData.showHeader = !$scope.guiData.showHeader;
      });
    }

    $scope.$on('emitMsg', function(event, data) {
      event.stopPropagation();
      $scope.$broadcast('consoleMsg', data);
    });

    function getSettings() {
      uiSettingsService.getSettings(true, $scope.auth.user.id)
        .then(function(uiSettings) {
          $scope.data.uiSettings = uiSettings;
          $scope.$broadcast('loadGui');
        }, function(err) {
          $scope.$broadcast('consoleMsg', err);
        });
    }

    if ($scope.auth.user) {
      getSettings();
    } else {
      $scope.$on('$firebaseSimpleLogin:login', function() {
        getSettings();
      });
    }

  }]);