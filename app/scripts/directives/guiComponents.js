'use strict';

angular.module('mudApp.mainView')

  .directive('quests', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            '{{data.uiSettings.quests}}' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {

      }
    };
  })

  .directive('npcs', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'NPCS' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('target', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'TARGET' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('chat', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'CHAT' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('menubar', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner btn-group">' +
            '<button class="btn btn-default" ng-repeat="window in windows" ng-click="toggleWindow(window.directiveName)">' +
              '<span class="{{window.display}}" tooltip="{{window.tooltip}}"></span>' +
            '</button>' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('battle', function() {
    return {
      restrict: 'E',
      controller: 'battleCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('party', function() {
    return {
      restrict: 'E',
      controller: 'partyCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('enemy', function() {
    return {
      restrict: 'E',
      controller: 'enemyCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('global', function() {
    return {
      restrict: 'E',
      controller: 'globalCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('char', function() {
    return {
      restrict: 'E',
      controller: 'charCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('inv', function() {
    return {
      restrict: 'E',
      controller: 'invCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('ownstatus', function() {
    return {
      restrict: 'E',
      controller: 'ownstatusCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('enemystatus', function() {
    return {
      restrict: 'E',
      controller: 'enemystatusCtrl',
      template: '<div class="colBox" resizable="true">' +
        '<div class="colBoxInner"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('worldmap', function() {
    return {
      restrict: 'E',
      controller: 'worldmapCtrl',
      template: '<div id="worldmapCont">' +
        '<div id="worldmapBox"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  });