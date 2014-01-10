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
            '<button class="btn btn-primary" ng-repeat="window in windows" ng-click="toggleWindow(window.directiveName)">' +
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
      template: '<div>' +
          '<div class="colBoxInner">' +
            'BATTLE' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('party', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'PARTY' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('enemy', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'ENEMY' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('global', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'GLOBAL' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('char', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'CHAR' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('inv', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'INV' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('ownstatus', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'OWN STATUS' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('enemystatus', function() {
    return {
      restrict: 'E',
      template: '<div>' +
          '<div class="colBoxInner">' +
            'ENEMY STATUS' +
          '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('worldmap', function() {
    return {
      restrict: 'E',
      template: '<div>' +
        '<div id="worldmapBox"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  });