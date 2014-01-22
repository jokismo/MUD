'use strict';

angular.module('mudApp.adminView')

  .controller('MapEditorCtrl', ['$scope', 'adminMapService', function($scope, adminMapService) {

    $scope.newMap = {
      show: false
    };
    $scope.mapList = {};
    $scope.regions = {};
    $scope.mapData = {};

    $scope.showCreateMap = function(show) {
      $scope.newMap.show = show;
    };

    function logMsg(msg) {
      $scope.$emit('emitMsg', { msg: msg});
    }

    function loadAfterAuth() {
      adminMapService.getMapList($scope.auth.user.id)
        .once('value', function(data) {
          $scope.$apply(function() {
            $scope.mapList = data.val();
          });
        }, function(err) {
          logMsg(err);
        });
      adminMapService.getRegions()
        .once('value', function(data) {
          $scope.regions = data.val();
        }, function(err) {
          logMsg(err);
        });
    }

    if ($scope.auth.user) {
      loadAfterAuth();
    } else {
      $scope.$on('$firebaseSimpleLogin:login', function() {
        loadAfterAuth();
      });
    }

    $scope.createMap = function() {
      adminMapService.initData($scope.newMap.rows, $scope.newMap.cols, $scope.newMap.region.name, $scope.newMap.mapName)
        .then(function(data) {
          adminMapService.bindTempMap($scope.auth.user.id, data)
            .then(function(mapBind) {
              logMsg('Map Ready');
              $scope.mapData = mapBind;
              $scope.mapData.$bind($scope, 'mapData').then(function(unbind) {
                logMsg('Map Bound');
              });
            }, function(err) {
              logMsg(err);
            });
        }, function(err) {
          logMsg(err);
        });
    };

  }]);