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
          '<input type="text" ng-model="newAdmin.userId" required>' +
          '<input type="radio" ng-model="newAdmin.isSuper" ng-value="true" />yes' +
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
        '<select ng-model="currentMapName" ng-options="map.name for map in mapList"><option value="">-- Temp Maps --</option></select>' +
        '<button ng-show="!newMap.show" ng-click="showCreateMap(true)">New Map</button>' +
        '<form novalidate name="mapForm" ng-show="newMap.show">' +
        'Rows: <input type="number" ng-model="newMap.rows" required><br>{{newMap.region}}' +
        'Cols: <input type="number" ng-model="newMap.cols" required><br>' +
        'Region: <select ng-model="newMap.region" ng-options="key for (key , value) in regions" required></select>' +
        'Name: <input type="text" ng-model="newMap.mapName" required><br>' +
        '<button ng-disabled="mapForm.$invalid" ng-click="createMap()">Create New Map</button>' +
        '</form>' +
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
        element.on('mousewheel', function(event) {
          if (event.deltaY > 0) {
            scope.refreshView(0.5);
          } else {
            scope.refreshView(-0.5);
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