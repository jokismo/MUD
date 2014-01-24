'use strict';

angular.module('mudApp.adminView')

  .directive('gamestatus', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div class="colBoxInner">' +
        'lorem' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('users', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div class="colBoxInner">' +
        '<form novalidate name="adminForm">' +
          '<input type="text" ng-model="newAdmin.userId" required><br>' +
          'Superadmin? <input type="radio" ng-model="newAdmin.isSuper" ng-value="true" />yes' +
          '<input type="radio" ng-model="newAdmin.isSuper" ng-value="false" />no' +
          '<button ng-disabled="adminForm.$invalid" ng-click="createAdmin()">Create Admin</button>' +
        '</form>' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('mapeditor', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div class="colBoxInner">' +
        'Saved Temp Maps:<select ng-model="currentMap" ng-options="map for map in mapList"></select>' +
        '<button ng-show="!newMap.show" ng-click="showCreateMap(true)">New Map</button>' +
        '<form novalidate name="mapForm" ng-show="newMap.show">' +
        'Rows: <input type="number" ng-model="newMap.rows" required><br>' +
        'Cols: <input type="number" ng-model="newMap.cols" required><br>' +
        'Region: <select ng-model="newMap.region" ng-options="region for region in regions" required></select>' +
        'Name: <input type="text" ng-model="newMap.mapName" required><br>' +
        '<button ng-disabled="mapForm.$invalid" ng-click="createMap()">Create New Map</button>' +
        '<button ng-click="showCreateMap(false)">Cancel</button>' +
        '</form>' +
        '<div ng-show="loaded">Map Data:' +
        '<button ng-click="saveMap();">Save</button><button>Revert</button><button>Save as New</button><input>' +
        '<br>Name:<input ng-model="mapData.name">' +
        '<br>Region:<select ng-model="mapData.region" ng-options="region for region in regions"></select><br>' +
        '<div ng-show="dataFromMap.show">Node Data:' +
        '<ul><li ng-repeat="(key, value) in filterDirec(mapData.nodes[dataFromMap.row][dataFromMap.col])" ng-click="clickChange(key)">{{key}} Current:{{value}}</li></ul>' +
        '<select ng-show="dataFromMap.showEdit" ng-model="dataFromMap.change" ng-options="state for state in mapStates"></select>' +
        'Room Data:<input ng-model="mapData.nodes[dataFromMap.row][dataFromMap.col].room">' +
        '</div>' +
        '<button ng-click="setWalkable()">Drag Walkable</button>' +
        '</div>' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('adminmap', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div id="worldmapBox"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
        var svg, drag, walkable, paths;
        var isMouseDown = false;
        var mouseEvents = {
          targetNodes: function(event) {
            var dataString = event.target.getAttribute('class');
            var dataArray = dataString.split('_');
            var mainNode = dataArray[0];
            if (event.target.tagName === 'path' && mainNode.length > 1) {
              mainNode = mainNode.split('-');
              scope.dataFromMap.showNode(mainNode[1], mainNode[2]);
            }
          },
          mouseScrollZoom: function(event) {
            if (event.deltaY > 0) {
              scope.refreshView(0.5);
            } else {
              scope.refreshView(-0.5);
            }
          },
          mouseWalkable: function(event) {
            var length, isMainNode;
            var dataString = event.target.getAttribute('class');
            var dataArray = dataString.split('_');
            var mainNode = dataArray[0];
            length = mainNode.length;

            if (event.type === 'mousedown') {
              isMouseDown = true;
              mainNode = mainNode.split('-');
              walkable = mainNode[0] === 'T';
            }
            if (isMouseDown) {
              isMainNode = length > 1;
              scope.dataFromMap.changeNodes(dataArray.splice(1), walkable, isMainNode);
            }

          }
        };
        scope.$on('mapLoaded', function() {
          svg = element.find('#worldmapBox');
          paths = svg.find('path');
          svg.on('mousewheel', mouseEvents.mouseScrollZoom);
          paths.on('click', mouseEvents.targetNodes);

        });

        scope.$on('editWalkable', function(event, isWalkable) {
          if (isWalkable) {
            drag = angular.copy(scope.data.uiSettings.guiSettings.draggable);
            scope.data.uiSettings.guiSettings.draggable = false;
            paths.off('click').on('mousedown', mouseEvents.mouseWalkable)
              .on('mouseenter', mouseEvents.mouseWalkable);
            svg.on('mouseup', function() {
                isMouseDown = false;
              })
              .on('mouseleave', function() {
                isMouseDown = false;
              });
          } else {
            scope.data.uiSettings.guiSettings.draggable = drag;
            paths.off('mouseenter').off('mousedown').on('click', mouseEvents.targetNodes);
            svg.off('mouseup').off('mouseleave');
          }
        });
      }
    };
  })

  .directive('console', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div class="colBoxInner">' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
        scope.$on('consoleMsg', function(event, data) {
          var myDate = new Date();
          element.find('.colBoxInner').prepend('<span>' + myDate.getUTCHours() + ':' + myDate.getUTCMinutes() + ':' + myDate.getUTCSeconds() + ' ' + data.msg + '</span><br>');
        });
      }
    };
  })

  .directive('adminbar', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div class="colBoxInner btn-group">' +
        '<button class="btn btn-primary" ng-repeat="window in windows" ng-click="toggleWindow(window.directiveName)">' +
        '<span class="{{window.display}}" tooltip="{{window.tooltip}}"></span>' +
        '</button>' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  });