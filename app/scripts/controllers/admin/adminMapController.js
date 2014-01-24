'use strict';

angular.module('mudApp.adminView')

  .controller('AdminMapCtrl', ['$scope', '$timeout', 'adminMapService', function($scope, $timeout, adminMapService) {

    $scope.mapDelta = 3;

    $scope.refreshView = function(delta) {
      $scope.mapDelta += delta;
      adminMapService.refreshView($scope.mapDelta, $scope.mapData);
    };

  }]);