'use strict';

angular.module('mudApp.mainView')

  .directive('quests', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="questCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('npcs', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="npcCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('target', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="targetCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('chat', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="chatCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('battle', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="battleCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('party', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="partyCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('enemy', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="enemyCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('global', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="globalCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('char', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="charCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('inv', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="invCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('ownstatus', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="ownstatusCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('enemystatus', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="colBox" resizable="true" ng-controller="enemystatusCtrl">' +
        '<div class="colBoxInner" ng-transclude></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  })

  .directive('worldmap', function() {
    return {
      restrict: 'E',
      template: '<div id="worldmapCont" ng-controller="worldmapCtrl">' +
        '<div id="worldmapBox"></div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  });