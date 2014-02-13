'use strict';

angular.module('mudApp.adminView')

  .controller('AdminMapCtrl', ['$scope', 'adminMapService', function($scope, adminMapService) {

    $scope.mapDelta = 3;

    $scope.refreshView = function(delta) {
      $scope.mapDelta += delta;
      adminMapService.refreshView($scope.mapDelta, $scope.mapData);
    };

  }]);