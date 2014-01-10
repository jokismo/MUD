'use strict';

angular.module('mudApp.mainView')

  .controller('worldmapCtrl', ['$scope', '$timeout', 'worldmapService', 'pathFindingService', function($scope, $timeout, worldmapService, pathFindingService) {

    $scope.worldmapdata = {};

    $scope.$on('loadGui', function() {
      $scope.worldmapdata = worldmapService.getData('testmap');

      $scope.worldmapdata.$on("loaded", function() {

        function isEmpty(obj) {
          return Object.keys(obj).length === 0;
        }

        function dataLoaded() {
          if (!isEmpty($scope.worldmapdata)) {
            worldmapService.initView($scope.worldmapdata);
            pathFindingService.initGrid($scope.worldmapdata);
          } else {
            $timeout(dataLoaded, 0);
          }
        }

        $timeout(dataLoaded, 0);
      });
      $scope.worldmapdata.$on("change", function() {

      });

      $scope.moveChar = function($event) {
        console.log(worldmapService.mainNodeGrid[0][1] === $event.target);
      };
    });


  }]);