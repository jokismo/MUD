'use strict';

angular.module('mudApp.mainView')

  .controller('GuiCtrl', ['$scope', 'loginService', 'settingsService', function($scope, loginService, settingsService) {

    $scope.showHeader = function() {
      $scope.$apply(function() {
        if ($scope.data.uiSettings.header) {
          $scope.data.uiSettings.header = '';
          $scope.data.uiSettings.showHeader = false;
        } else {
          $scope.data.uiSettings.header = 'headerOn';
          $scope.data.uiSettings.showHeader = true;
        }
      });
    };

    if ($scope.auth.user !== null) {
      settingsService.init($scope.auth.user.uid);

      $scope.gui = {
        leftCol: true,
        rightCol: true
      };
      $scope.data.uiSettings = settingsService.getSettings();
      $scope.data.uiSettings.$on("loaded", function() {
        setCols($scope.data.uiSettings.columns);
      });
      $scope.data.uiSettings.$on("change", function() {
        setCols($scope.data.uiSettings.columns);
      });

    }

    function setCols(cols) {
      switch(cols) {
        case 1 :
          $scope.gui.leftCol = false;
          $scope.gui.rightCol = false;
          break;
        case 2 :
          $scope.gui.leftCol = true;
          $scope.gui.rightCol = false;
          break;
        case 3 :
          $scope.gui.leftCol = true;
          $scope.gui.rightCol = true;
          break;
      }
    }

}]);