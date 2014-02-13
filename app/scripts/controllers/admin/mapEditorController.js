'use strict';

angular.module('mudApp.adminView')

  .controller('MapEditorCtrl', ['$scope', 'adminMapService', '$timeout', function($scope, adminMapService, $timeout) {

    $scope.newMap = {
      show: false
    };
    $scope.mapList = [];
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
    $scope.walkableButton = 'Edit Walkable';
    $scope.nodeState = {
      temp: false
    };
    $scope.nodeStates = [{
      name: 'water',
      code: 'b'
    }, {
      name: 'dirt',
      code: 'c'
    }, {
      name: 'ice',
      code: 'd'
    }];
    $scope.dataForNpc = {
      nodeArray: []
    };

    // show map view
    function mapLoaded(loaded) {
      $scope.loaded = loaded;
    }

    // show new map create
    $scope.showCreateMap = function(show) {
      $scope.newMap.show = show;
    };

    // refresh scope utility
    function refreshScope(func) {
      if(!$scope.$$phase) {
        $scope.$apply(func);
      } else {
        func();
      }
    }

    // filter out data for room direc view
    $scope.filterDirec = function(items) {
      var result = {};
      var array = ['room', 'rows', 'cols', 'roomMap'];
      angular.forEach(items, function(value, key) {
        if (array.indexOf(key) === -1) {
          result[key] = value;
        }
      });
      return result;
    };

    // log messages to console
    function logMsg(msg) {
      $scope.$emit('emitMsg', { msg: msg});
    }

    // get list of temp maps
    function getMapList() {
      adminMapService.getMapList($scope.auth.user.id)
        .once('value', function(data) {
          refreshScope(function() {
            $scope.mapList = [];
            angular.forEach(data.val(), function(value, key) {
              $scope.mapList.push(value);
            });
          });
        }, function(err) {
          logMsg(err);
        });
    }

    //watch for map refresh hook
    $scope.$watch('mapData.newData', function(newData, oldData) {
      if (newData === 'refresh') {
        $timeout(function() {
          adminMapService.refreshNodes($scope.mapData);
          logMsg('Map View Refreshed With Server Data');
        }, 0);
      }
    });

    //refresh map
    $scope.syncMap = function() {
      $scope.dataFromMap.show = false;
      $scope.mapData.newData = 'refresh';
      if ($scope.editWalkableState) {
        $scope.setWalkable();
      }
      $scope.mapData.$save();
      adminMapService.refreshNodes($scope.mapData);
      $timeout(function() {
        $scope.mapData.newData = false;
        $scope.mapData.$save();
      }, 100);
    };

    // wait for auth to load data dependent services
    function loadAfterAuth() {
      getMapList();
      // get regions list
      adminMapService.getRegions()
        .once('value', function(data) {
          $scope.regions = Object.keys(data.val());
        }, function(err) {
          logMsg(err);
        });
      // watch map selection, load map if new map selected
      $scope.$watch('currentMap', function(newValue) {
        if (typeof newValue !== 'undefined') {
          $scope.dataFromMap.show = false;
          adminMapService.loadMap($scope.auth.user.id, newValue)
            .then(function(bind) {
              $scope.mapData = bind;
              $scope.$broadcast('mapLoaded', $scope.mapData.name, true);
              mapLoaded(true);
            }, function(err) {
              logMsg(err);
            });
        }
      });
    }

    // check auth, if not wait for auth
    if ($scope.auth.user) {
      loadAfterAuth();
    } else {
      $scope.$on('$firebaseSimpleLogin:login', function() {
        loadAfterAuth();
      });
    }

    // main node has been clicked, update data
    $scope.dataFromMap.showNode = function(row, col) {
      adminMapService.currentNode(row, col);
      refreshScope(function() {
        $scope.dataFromMap.row = row;
        $scope.dataFromMap.col = col;
        $scope.dataFromMap.change = null;
        $scope.dataFromMap.show = true;
        $scope.$broadcast('refreshNodeMap', row, col);
      });
      // watch for manual node change, change corresponding node if necessary
      $scope.$watch('dataFromMap.change', function(newVal) {
        var dataArray = [];
        var walkable;
        if (typeof newVal !== 'undefined' && newVal !== null && newVal !== $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col][$scope.dataFromMap.direc]) {
          dataArray[0] = $scope.dataFromMap.row + '-' + $scope.dataFromMap.col + '-' + $scope.dataFromMap.direc;
          var changes = adminMapService.findChanges($scope.mapData.rows, $scope.mapData.cols, $scope.dataFromMap.row, $scope.dataFromMap.col, $scope.dataFromMap.direc);
          $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col][$scope.dataFromMap.direc] = newVal;
          if (changes) {
            $scope.mapData.nodes[changes[0]][changes[1]][changes[2]] = newVal;
            dataArray[1] = changes[0] + '-' + changes[1] + '-' + changes[2];
            logMsg('Corresponding Node' + changes + 'changed');
          }
          walkable = newVal === 'b';
          adminMapService.simpleRefresh(dataArray, walkable, false);
          $scope.saveData();
          $scope.dataFromMap.showEdit = false;
        }
      });
    };

    // logic to show and handle manual node change
    $scope.clickChange = function(direc) {
      $scope.dataFromMap.direc = direc;
      $scope.dataFromMap.change = $scope.mapData.nodes[$scope.dataFromMap.row][$scope.dataFromMap.col][$scope.dataFromMap.direc];
      $scope.dataFromMap.showEdit = true;
    };

    // allow node editing by click and drag
    $scope.setWalkable = function() {
      $scope.editWalkableState = !$scope.editWalkableState;
      if ($scope.editWalkableState) {
        $scope.walkableButton = 'Cancel Edit';
      } else {
        $scope.walkableButton = 'Edit Walkable';
      }
      $scope.$broadcast('editWalkable', $scope.editWalkableState);
    };

    // handle data change request from click or mouseover on map
    $scope.dataFromMap.changeNodes = function(dataArray, walkable, mainNode) {
      adminMapService.simpleRefresh(dataArray, walkable, mainNode);
      var length = dataArray.length, i, coord, newState;
      if (walkable) {
        newState = 'b';
      } else {
        newState = 'c';
      }
      refreshScope(function() {
        for (i = 0; i < length; i++) {
          coord = dataArray[i].split('-');
          if (i === 0 && mainNode === true) {
            $scope.mapData.nodes[coord[0]][coord[1]].room = !walkable;
          } else {
            $scope.mapData.nodes[coord[0]][coord[1]][coord[2]] = newState;
          }
        }
      });
    };

    $scope.saveData = function() {
      $scope.mapData.$save();
    };

    // create new map
    $scope.createMap = function() {
      $scope.dataFromMap.show = false;
      adminMapService.initData($scope.newMap)
        .then(function(data) {
          $scope.newMap = {
            show: false
          };
          adminMapService.bindNewMap($scope.auth.user.id, data)
            .then(function(mapBind) {
              $scope.mapData = mapBind;
              $scope.mapData.$on('loaded', function() {
                getMapList();
                logMsg('Map Ready');
                $scope.$broadcast('mapLoaded', $scope.mapData.name, true);
                mapLoaded(true);
              });
            }, function(err) {
              logMsg(err);
            });
        }, function(err) {
          logMsg(err);
        });
    };

    // sync nodes with map state
    $scope.autoNodes = function() {
      $scope.tempNodes = angular.copy($scope.mapData.nodes);
      $scope.nodeState.temp = true;
      adminMapService.autoNodes($scope.nodeState.state.code, $scope.mapData, $scope.nodeState.opening);
      $scope.$broadcast('refreshNodeMap', $scope.dataFromMap.row, $scope.dataFromMap.col);
    };

    // reset node state
    $scope.saveNodes = function() {
      $scope.saveData();
      $scope.nodeState.temp = false;
    };

    // reset node state
    $scope.resetNodes = function() {
      $scope.mapData.nodes = angular.copy($scope.tempNodes);
      $scope.nodeState.temp = false;
      $scope.$broadcast('refreshNodeMap', $scope.dataFromMap.row, $scope.dataFromMap.col);
    };

    $scope.$on('setNpcLoc', function(event, setNpc) {
      $scope.$broadcast('mapNpcLoc', setNpc);
    });

    $scope.showNpcNode = function(row, col) {
      refreshScope(function() {
        adminMapService.showNpcNode(row, col);
      });
    };

    $scope.revertNpcNode = function(row, col) {
      refreshScope(function() {
        adminMapService.revertNpcNode(row, col);
      });
    };

    $scope.revertNpcNodes = function() {
      refreshScope(function() {
        adminMapService.revertNpcNodes();
      });
    };

  }]);