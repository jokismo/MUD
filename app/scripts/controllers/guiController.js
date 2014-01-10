'use strict';

angular.module('mudApp.mainView')

  .controller('GuiCtrl', ['$scope', 'loginService', 'settingsService', '$timeout', '$route', function($scope, loginService, settingsService, $timeout, $route) {

    Mousetrap.bind('esc', showHeader);

    function showHeader() {
      $scope.$apply(function() {
        $scope.data.uiSettings.header.showHeader = !$scope.data.uiSettings.header.showHeader;
      });
    }

    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }

    if ($scope.auth.user !== null) {

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

    }


}]);