'use strict';

angular.module('mudApp.adminView')

  .controller('MapEditorCtrl', ['$scope', 'adminMapService', '$q', function($scope, adminMapService, $q) {

    $scope.newMap = {
      show: false
    };
    $scope.mapList = {};
    $scope.regions = {};
    $scope.mapData = {};
    $scope.nodeData = {
      show: false
    };
    $scope.loaded = false;
    $scope.dataFromMap = {
    };
    $scope.mapStates = ['c', 'b', 'd'];
    $scope.editWalkableState = false;

    function mapLoaded(loaded) {
      $scope.loaded = loaded;
    }

    $scope.showCreateMap = function(show) {
      $scope.newMap.show = show;
    };

    function refreshScope(func) {
      if(!$scope.$$phase) {
        $scope.$apply(func);
      } else {
        func();
      }
    }

    $scope.filterDirec = function(items) {
      var result = {};
      angular.forEach(items, function(value, key) {
        if (key !== 'room') {
          result[key] = value;
        }
      });
      return result;
    };

    function logMsg(msg) {
      $scope.$emit('emitMsg', { msg: msg});
    }

    function getMapList() {
      adminMapService.getMapList($scope.auth.user.id)
        .once('value', function(data) {
          $scope.$apply(function() {
            $scope.mapList = Object.keys(data.val());
          });
        }, function(err) {
          logMsg(err);
        });
    }

    function watchData() {
      var watch = $scope.$watch('mapData.nodes', function() {
        adminMapService.refreshNodes($scope.mapData);
        logMsg('Map View Refreshed');
      }, true);
      return watch;
    }

    function cancelWatch() {
      if (typeof $scope.cancelWatch === 'function') {
        $scope.cancelWatch();
      }
    }

    function loadAfterAuth() {
      getMapList();
      adminMapService.getRegions()
        .once('value', function(data) {
          $scope.regions = Object.keys(data.val());
        }, function(err) {
          logMsg(err);
        });


      $scope.$watch('currentMap', function(newValue) {
        cancelWatch();
        if (typeof newValue !== 'undefined') {
          $scope.dataFromMap.show = false;
          $scope.mapData = adminMapService.loadMap($scope.auth.user.id, newValue);
          $scope.mapData.$on('loaded', function() {
            $scope.cancelWatch = watchData();
            $scope.$broadcast('mapLoaded');
          });
          mapLoaded(true);
        }
      });
    }

    if ($scope.auth.user) {
      loadAfterAuth();
    } else {
      $scope.$on('$firebaseSimpleLogin:login', function() {
        loadAfterAuth();
      });
    }

    $scope.dataFromMap.showNode = function(row, col) {
      refreshScope(function() {
        $scope.dataFromMap.row = row;
        $scope.dataFromMap.col = col;
        $scope.dataFromMap.change = null;
        $scope.dataFromMap.show = true;
      });

      $scope.$watch('dataFromMap.change', function(newVal) {
        if (typeof newVal !== 'undefined' && newVal !== null && newVal !== $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col][$scope.dataFromMap.direc]) {
          var changes = adminMapService.findChanges($scope.mapData.rows, $scope.mapData.cols, $scope.dataFromMap.row, $scope.dataFromMap.col, $scope.dataFromMap.direc);
          $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col][$scope.dataFromMap.direc] = newVal;
          if (changes) {
            $scope.mapData.nodes[changes[0]][changes[1]][changes[2]] = newVal;
            logMsg('Corresponding Node' + changes + 'changed');
          }
          $scope.dataFromMap.showEdit = false;
        }
      });
    };

    $scope.clickChange = function(direc) {
      $scope.dataFromMap.direc = direc;
      $scope.dataFromMap.change = $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col][$scope.dataFromMap.direc];
      $scope.dataFromMap.showEdit = true;
    };

    $scope.setWalkable = function() {
      $scope.editWalkableState = !$scope.editWalkableState;
      $scope.$broadcast('editWalkable', $scope.editWalkableState);
    };

    $scope.dataFromMap.changeNodes = function(dataArray, walkable, mainNode) {
      var length = dataArray.length, i, coord, newState;
      if (walkable) {
        newState = 'b';
      } else {
        newState = 'c';
      }
      cancelWatch();
      refreshScope(function() {
        for (i = 0; i < length; i++) {
          if (i === length - 1) {
            $scope.cancelWatch = watchData();
          }
          coord = dataArray[i].split('-');
          if (i === 0 && mainNode === true) {
            $scope.mapData.nodes[coord[0]][coord[1]].room = !walkable;
          }
          $scope.mapData.nodes[coord[0]][coord[1]][coord[2]] = newState;
          if (i === length - 1) {
            saveMap();
          }
        }
      });
    };

    function saveMap() {
      $scope.mapData.$save()
        .then(function() {
          logMsg('Data Saved');
        }, function(err) {
          logMsg(err);
        });
    }

    $scope.createMap = function() {
      cancelWatch();
      $scope.dataFromMap.show = false;
      adminMapService.initData($scope.newMap.rows, $scope.newMap.cols, $scope.newMap.region, $scope.newMap.mapName)
        .then(function(data) {
          adminMapService.bindNewMap($scope.auth.user.id, data)
            .then(function(mapBind) {
              logMsg('Map Ready');
              $scope.mapData = mapBind;
              mapLoaded(true);
              getMapList();
              $scope.cancelWatch = watchData();
            }, function(err) {
              logMsg(err);
            });
        }, function(err) {
          logMsg(err);
        });
    };

  }]);