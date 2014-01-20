'use strict';

angular.module('mudApp.mainView')

  .controller('WorldmapCtrl', ['$scope', '$timeout', 'worldmapService', 'pathFindingService', function($scope, $timeout, worldmapService, pathFindingService) {
    /**
    $scope.worldmapdata = {};
    $scope.mapService = worldmapService;
    $scope.moving = false;

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

    });

    $scope.moveChar = function($event) {
      if ($event.target.tagName === 'path' && $event.target.dataset.mainNode === "true" && $event.target.dataset.mapNode !== worldmapService.currentNodeElem) {
        if ($scope.moving) {
          $timeout.cancel(worldmapService.timeout);
          if (worldmapService.currentNode.node.dataset.mainNode !== 'true') {
            var lastNode = worldmapService.nodeToArray($scope.lastNode);
            worldmapService.setCurrentNode(lastNode[0], lastNode[1], false);
          }
          worldmapService.moving = false;
        }
        var coords = worldmapService.pathFindCoords($event.target.dataset.mapNode);
        var path = pathFindingService.pathFind(coords[0], coords[1]);
        path.then(function(path) {
          worldmapService.moving = true;
          worldmapService.moveChar(path);
        });
      }
    };

    $scope.$watch('mapService.currentNodeElem', function(newvalue, oldvalue) {
      $scope.lastNode = oldvalue;
    });

    $scope.$watch('mapService.moving', function(moving) {
      $scope.moving = moving;
    });
    **/

  }]);