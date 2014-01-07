'use strict';

angular.module('mudApp.mainView')

  .controller('GuiCtrl', ['$scope', 'loginService', 'settingsService', '$timeout', function($scope, loginService, settingsService, $timeout) {

    Mousetrap.bind('esc', showHeader);

    function showHeader() {
      $scope.$apply(function() {
        $scope.data.uiSettings.header.showHeader = !$scope.data.uiSettings.header.showHeader;
      });
    }

    if ($scope.auth.user !== null) {

      settingsService.init($scope.auth.user.uid);

      $scope.data.uiSettings = settingsService.getSettings();

      $scope.data.uiSettings.$on("loaded", function() {
        function dataLoaded() {
          if ($scope.data.uiSettings.quests) {

            $scope.$broadcast('loadGui');
          } else {
            $timeout(dataLoaded, 50);
          }
        }

        $timeout(dataLoaded, 50);

      });
      $scope.data.uiSettings.$on("change", function() {

      });

    }


}]);