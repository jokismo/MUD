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
  })

  .directive('charselect', function() {
    return {
      restrict: 'E',
      template: '' +
        '<div>' +
        '<div class="colBoxInner">' +
        '<div ng-show="!newHouseNav.show">' +
        '<div ng-repeat="(factionId, houseData) in charData">{{factions[factionId].name}}' +
        '<div ng-repeat="(houseId, house) in houseData">' +
        '<button ng-click="showChars(house.name, factionId)">{{house.name}}</button>' +
        '<div ng-show="house.name === showHouse">' +
        '<div ng-repeat="(charId, char) in house.chars">' +
        '<div ng-click="selectedChar(houseId, charId, char.nick, $index)">' +
        '<span ng-show="char.nick !== \'notSet\'">{{char.nick}}</span>' +
        '{{char.firstName}}{{char.lastName}}{{$index}}<br>{{char.stats}}' +
        '</div>' +
        '<form novalidate name="nickForm" ng-show="createNickIndex === $index">' +
        '<input type="text" ng-model="nickName.name" name="nickName" required> {{nickName.name}}' +
        '<p ng-show="nickForm.nickName.$dirty && nickForm.nickName.$error.required">Name is Empty</p>' +
        '<button ng-show="!nickName.nickCreateUpdate" ng-disabled="nickForm.$invalid" ng-click="createNick(houseId, charId)">Create Nick and Load</button>{{nickName.nickCreateErr}}' +
        '<div ng-show="nickName.nickCreateUpdate">{{nickName.nickCreateUpdate}}</div>' +
        '<div ng-show="nickName.nickCreateErr">{{nickName.nickCreateErr}}</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<button ng-click="showHouseCreate(true, \'one\')" ng-show="!newHouseNav.show">New House</button>' +
        '<button ng-click="showHouseCreate(false)" ng-show="newHouseNav.show && newHouseNav.step === \'one\'">House List</button>' +
        '<button ng-click="showHouseCreate(true, \'one\')" ng-show="newHouseNav.show && newHouseNav.step === \'two\'">Faction List</button>' +
        '<div ng-show="newHouseNav.show">' +
        '<div ng-show="newHouseNav.step === \'one\'"><div ng-repeat="faction in factions" ng-click="createHouse(faction.name, $index)">{{faction.name}}</div></div>' +
        '<div ng-show="newHouseNav.step === \'two\'">' +
        '<form novalidate name="houseForm">' +
        '<input type="text" ng-model="newHouse.name" name="houseName" required><p>Faction: {{newHouse.factionId}}</p><p>House of {{newHouse.name}}</p>' +
        '<p ng-show="houseForm.houseName.$dirty && houseForm.houseName.$error.required">Name is Empty</p>' +
        '<button ng-show="!charCreateUpdate" ng-disabled="houseForm.$invalid" ng-click="saveHouse()">Create House</button>' +
        '<div ng-show="charCreateUpdate">{{charCreateUpdate}}</div>' +
        '<div ng-show="charCreateErr">{{charCreateErr}}</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
      link: function(scope, element, attrs) {
      }
    };
  });