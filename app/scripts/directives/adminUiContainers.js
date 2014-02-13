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
        'Default Room: <input type="number" ng-model="newMap.roomRows" required><input type="number" ng-model="newMap.roomCols" required><br>' +
        'Region: <select ng-model="newMap.region" ng-options="region for region in regions" required></select>' +
        'Name: <input type="text" ng-model="newMap.mapName" required><br>' +
        '<button ng-disabled="mapForm.$invalid" ng-click="createMap()">Create New Map</button>' +
        '<button ng-click="showCreateMap(false)">Cancel</button>' +
        '</form>' +
        '<div ng-show="loaded">Map Data' +
        '<br>Name:<input ng-model="mapData.name">' +
        '<br>Region:<select ng-model="mapData.region" ng-options="region for region in regions"></select><br>' +
        '<div ng-show="dataFromMap.show">Node Data:' +
        '<ul><li ng-repeat="(key, value) in filterDirec(mapData.nodes[dataFromMap.row][dataFromMap.col])" ng-click="clickChange(key)">{{key}} Current:{{value}}</li></ul>' +
        '<select ng-show="dataFromMap.showEdit" ng-model="dataFromMap.change" ng-options="state for state in mapStates"></select>' +
        'Room Data:<input ng-model="mapData.nodes[dataFromMap.row][dataFromMap.col].room">' +
        '</div>' +
        '<button ng-click="setWalkable()">{{walkableButton}}</button><button ng-click="syncMap()">Server Sync</button><br>' +
        '<form novalidate name="setNodesForm">' +
        'Default Node Type:<select ng-model="nodeState.state" ng-options="state.name for state in nodeStates" required></select><br>' +
        'Default Wall Opening:<input ng-model="nodeState.opening"  type="number" required><br>' +
        '<button ng-disabled="setNodesForm.$invalid" ng-click="autoNodes()">Auto Nodes</button>' +
        '<button ng-show="nodeState.temp" ng-click="saveNodes()">Save</button>' +
        '<button ng-show="nodeState.temp" ng-click="resetNodes()">Reset</button>' +
        '</form>' +
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
        var svg, drag, walkable, paths, cancels = [];
        var isMouseDown = false;
        var mouseEvents = {
          targetNodes: function(event) {
            event.stopPropagation();
            var dataString = event.target.getAttribute('class');
            var dataArray = dataString.split('_');
            var mainNode = dataArray[0];
            if (mainNode.length > 1) {
              mainNode = mainNode.split('-');
              scope.dataFromMap.showNode(mainNode[1], mainNode[2]);
            }
          },
          setNpc: function(event) {
            event.stopPropagation();
            var node, index;
            var dataString = event.target.getAttribute('class');
            var dataArray = dataString.split('_');
            var mainNode = dataArray[0];
            if (event.type === 'mousedown') {
              isMouseDown = true;
            }
            if (isMouseDown && mainNode.length > 1) {
              mainNode = mainNode.split('-');
              node = mainNode[1] + ',' + mainNode[2];
              index = scope.dataForNpc.nodeArray.indexOf(node);
              if (index === -1) {
                scope.dataForNpc.nodeArray.push(node);
                scope.showNpcNode(mainNode[1], mainNode[2]);
              } else {
                console.log('asdf');
                scope.dataForNpc.nodeArray.splice(index, 1);
                scope.revertNpcNode(mainNode[1], mainNode[2]);
              }
            }
          },
          mouseScrollZoom: function(event) {
            event.stopPropagation();
            if (event.deltaY > 0) {
              scope.refreshView(0.5);
            } else {
              scope.refreshView(-0.5);
            }
          },
          mouseWalkable: function(event) {
            event.stopPropagation();
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
                scope.saveData();
              }).on('mouseleave', function() {
                isMouseDown = false;
                scope.saveData();
              });
            var cancel = scope.$on('mapLoaded', function() {
              scope.setWalkable();
            });
            cancels.push(cancel);
          } else {
            resetState();
          }
        });
        scope.$on('mapNpcLoc', function(event, setNpc) {
          if (setNpc) {
            drag = angular.copy(scope.data.uiSettings.guiSettings.draggable);
            scope.data.uiSettings.guiSettings.draggable = false;
            paths.off('click').on('mousedown', mouseEvents.setNpc)
              .on('mouseenter', mouseEvents.setNpc);
            svg.on('mouseup', function() {
              isMouseDown = false;
            }).on('mouseleave', function() {
                isMouseDown = false;
              });
            var cancel = scope.$on('mapLoaded', function() {
              resetState();
            });
            cancels.push(cancel);
          } else {
            resetState();
            scope.revertNpcNodes();
          }
        });
        function resetState() {
          var length = cancels.length, i;
          if (length > 0) {
            for(i = 0; i < length; ++i) {
              cancels[i]();
            }
            cancels = [];
          }
          scope.data.uiSettings.guiSettings.draggable = drag;
          paths.off('mouseenter').off('mousedown').on('click', mouseEvents.targetNodes);
          svg.off('mouseup').off('mouseleave');
        }
      }
    };
  })

  .directive('nodemap', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div id="nodemapBox"></div>' +
        '<div class="colBoxInner">' +
        '<select ng-model="nodeState" ng-options="state.name for state in nodeStates"></select>' +
        '<button ng-click="setState()">Set New State</button><button>Add Object</button>' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
        var svg, drag, paths;
        var isMouseDown = false;
        var mouseEvents = {
          mouseScrollZoom: function(event) {
            event.stopPropagation();
            if (event.deltaY > 0) {
              scope.refreshView(0.5);
            } else {
              scope.refreshView(-0.5);
            }
          },
          mouseState: function(event) {
            event.stopPropagation();
            var dataString = event.target.getAttribute('class');
            var dataArray = dataString.split(',');
            if (event.type === 'mousedown') {
              isMouseDown = true;
            }
            if (isMouseDown) {
              scope.changeState(dataArray);
            }
          }
        };
        scope.$on('nodeMapLoaded', function() {
          svg = element.find('#nodemapBox');
          paths = svg.find('path');
          svg.on('mousewheel', mouseEvents.mouseScrollZoom);
        });
        scope.$on('editState', function(event, editState) {
          if (editState) {
            drag = angular.copy(scope.data.uiSettings.guiSettings.draggable);
            scope.data.uiSettings.guiSettings.draggable = false;
            paths.on('mousedown', mouseEvents.mouseState)
              .on('mouseenter', mouseEvents.mouseState);
            svg.on('mouseup', function() {
              isMouseDown = false;
              scope.saveData();
            }).on('mouseleave', function() {
              isMouseDown = false;
              scope.saveData();
            });
          } else {
            scope.data.uiSettings.guiSettings.draggable = drag;
            paths.off('mouseenter').off('mousedown');
            svg.off('mouseup').off('mouseleave');
          }
        });
      }
    };
  })

  .directive('npceditor', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div class="colBoxInner">' +
        'Npc List:<select ng-model="currentNpc" ng-options="npc for npc in npcData"></select>' +
        '<button ng-show="!newNpc.show" ng-click="showCreateNpc(true)">New Npc</button>' +
        '<form novalidate name="npcForm" ng-show="newNpc.show">' +
        'Faction: <select ng-model="newNpc.faction" ng-options="faction.name for faction in factions" required></select><br>' +
        'Race: <select ng-model="newNpc.race" ng-options="key for (key, value) in races" required></select><br>' +
        'Class: <select ng-model="newNpc.class" ng-options="key for (key, value) in classes" required></select><br>' +
        'Name: <input type="text" ng-model="newNpc.name" required><br>' +
        'Actions: <select ng-model="newNpc.actionState" ng-options="state for state in actionStates"></select>' +
        '<select ng-model="newNpc.actionType" ng-options="type for type in actionTypes"></select><input type="text" ng-model="newNpc.action"><button ng-click="addAction()">Add</button><br>' +
        '<div ng-show="newNpc.actionCount !== 0"><div ng-repeat="(key, val) in newNpc.actions">' +
        '<div ng-show="newNpc.actions[key].length !== 0">{{key}}:<div ng-repeat="action in val">{{action.type}}: {{action.action}}</div></div>' +
        '</div></div>' +
        '{{dataForNpc.nodeArray.length === 0? "Click Nodes to Set" : dataForNpc.nodeArray}}' +
        '<select ng-model="newNpc.pathType" ng-options="path for path in pathTypes" required></select><br>' +
        '<button ng-disabled="npcForm.$invalid" ng-click="createNpc()">Create NPC</button>' +
        '<button ng-click="showCreateNpc(false)">Cancel</button>' +
        '<div ng-show="err">{{err}}</div>' +
        '</form>' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {

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