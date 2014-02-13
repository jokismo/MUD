'use strict';

angular.module('mudApp.adminView')

  .controller('NodeMapCtrl', ['$scope', 'nodeMapService', function($scope, nodeMapService) {

    $scope.mapDelta = 3;

    $scope.$on('refreshNodeMap', function(event, row, col) {
      nodeMapService.refreshView(4, $scope.mapData.nodes[row][col]);
      $scope.$broadcast('nodeMapLoaded');
    });

    $scope.refreshView = function(delta) {
      $scope.mapDelta += delta;
      nodeMapService.refreshView($scope.mapDelta, $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col]);
    };

    $scope.nodeStates = [{
      name: 'wall',
      code: 'a'
    }, {
      name: 'water',
      code: 'b'
    }, {
      name: 'dirt',
      code: 'c'
    }, {
      name: 'ice',
      code: 'd'
    }];

    $scope.dragState = false;

    $scope.setState = function() {
      if (typeof $scope.nodeState !== 'undefined') {
        $scope.dragState = !$scope.dragState;
        $scope.$broadcast('editState', $scope.dragState);
      }
    };

    $scope.changeState = function(array) {
      $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col].roomMap[array[0]][array[1]] = $scope.nodeState.code;
      nodeMapService.simpleRefresh(array, $scope.nodeState.code);
    };

    $scope.saveData = function() {
      $scope.mapData.$save();
    };

  }]);