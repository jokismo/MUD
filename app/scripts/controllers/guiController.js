'use strict';

angular.module('mudApp.mainView')

  .controller('GuiCtrl', ['$scope', 'loginService', 'settingsService', function($scope, loginService, settingsService) {

    settingsService.init($scope.auth.user.uid);

    $scope.gui = {
      leftCol: true,
      rightCol: true
    };
    $scope.data = {};
    $scope.data.uiSettings = settingsService.getSettings();
    $scope.data.uiSettings.$on("loaded", function() {
      setCols();
    });
    $scope.data.uiSettings.$on("change", function() {
      setCols();
    });

    function setCols() {
      switch($scope.data.uiSettings.columns) {
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