'use strict';

angular.module('mudApp.mainView')

  .controller('GuiCtrl', ['$scope', '$timeout', '$location', function($scope, $timeout, $location) {

    $timeout(function() {
      if ($scope.auth.user === null) {

      }
    });

    $scope.guiData = {};
    $scope.guiData.charSelect = {
      done: false,
      charSelect: true,
      charCreate: false
    };

    Mousetrap.bind('esc', showHeader);

    function showHeader() {
      $scope.$apply(function() {
        $scope.guiData.showHeader = !$scope.guiData.showHeader;
      });
    }

    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }

    $scope.$on('GuiReady', function(event) {
      event.stopPropagation();
      $scope.guiData.charSelect = {
        done: true,
        charSelect: true,
        charCreate: false
      };
      $scope.$broadcast('loadGui');

    });

    /** if ($scope.auth.user !== null) {

      presenceService.init($scope.auth.user.uid);

      settingsService.init($scope.auth.user.uid);

      $scope.data.uiSettings = settingsService.getSettings();

      $scope.data.uiSettings.$on("loaded", function() {

        function dataLoaded() {
          if (!isEmpty($scope.data.uiSettings)) {
            $scope.$broadcast('loadGui');
          } else {
            $timeout(dataLoaded, 0);
          }
        }

        $timeout(dataLoaded, 0);

      });
      $scope.data.uiSettings.$on("change", function() {

      });

    }**/


  }]);