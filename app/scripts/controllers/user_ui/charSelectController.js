'use strict';

angular.module('mudApp.mainView')

  .controller('CharSelectCtrl', ['$scope', 'firebaseBind', 'charService', 'settingsService', 'firebaseRef', 'presenceService', function($scope, firebaseBind, charService, settingsService, firebaseRef, presenceService) {

    firebaseRef('factions').once('value', function(data) {
      $scope.factions = data.val();
    });
    $scope.charData = {};
    if ($scope.auth.user) {
      $scope.charData = firebaseBind(['users', $scope.auth.user.id, 'houses']);
    } else {
      $scope.$on('$firebaseSimpleLogin:login', function() {
        $scope.charData = firebaseBind(['users', $scope.auth.user.id, 'houses']);
      });
    }

    $scope.newHouse = {
      name: ''
    };
    $scope.newHouseNav = {
      show: false,
      step: 'one'
    };
    $scope.nickName = {
      name: '',
      nickCreateUpdate: false,
      nickCreateErr: false
    };

    $scope.showHouseCreate = function(show, step) {
      $scope.newHouseNav.show = show;
      $scope.newHouseNav.step = step;
    };

    $scope.showChars = function(house, factionId) {
      $scope.createNickIndex = null;
      if ($scope.showHouse === house) {
        $scope.showHouse = null;
      } else {
        $scope.showHouse = house;
        $scope.factionId = factionId;
      }
    };

    $scope.createHouse = function(house, id) {
      $scope.newHouse.faction = house;
      $scope.newHouse.factionId = id;
      $scope.showHouseCreate(true, 'two');
    };

    $scope.saveHouse = function() {
      charCreateMessages('Checking for Duplicate Name', null);
      charService.newHouse($scope.newHouse, $scope.auth.user.id)
        .then(function() {
          $scope.newHouse.name = '';
          charCreateMessages(false, false);
          $scope.showHouseCreate(false, 'one');
      }, function(reason) {
        charCreateMessages(false, reason);
      }, function(update) {
        charCreateMessages(update, null);
      });
    };

    function charCreateMessages(update, error) {
      $scope.charCreateUpdate = update;
      $scope.charCreateErr = error;
    }

    $scope.selectedChar = function(houseId, charId, charNick, index) {
      $scope.nickName.name = '';
      $scope.nickName.nickCreateErr = false;
      if (charNick !== 'notSet') {
        setCurrentChar(houseId, charId, charNick);
        presenceService.charOnline($scope.data.currentChar);
        settingsService.getSettings($scope.auth.user.id, $scope.factionId, houseId, charId, $scope.data.isMobile)
          .then(function(data) {
            $scope.data.uiSettings = data;
            $scope.$emit('GuiReady');
        });
      } else {
        $scope.createNickIndex = index;
      }
    };

    $scope.createNick = function(houseId, charId) {
      nickCreateMessages('Checking for Duplicate Name', null);
      charService.createNick($scope.auth.user.id, $scope.factionId, houseId, charId, $scope.nickName.name)
        .then(function(uiSettings) {
          setCurrentChar(houseId, charId, $scope.nickName.name);
          presenceService.charOnline($scope.data.currentChar);
          nickCreateMessages(false, false);
          $scope.data.uiSettings = angular.copy(uiSettings);
          $scope.$emit('GuiReady');
      }, function(reason) {
        nickCreateMessages(false, reason);
      }, function(deferred) {
        nickCreateMessages('Setting up UI', null);
        settingsService.initUser(deferred, $scope.auth.user.id, $scope.factionId, houseId, charId, $scope.data.isMobile);
      });
    };

    function nickCreateMessages(update, error) {
      $scope.nickName.nickCreateUpdate = update;
      $scope.nickName.nickCreateErr = error;
    }

    function setCurrentChar(houseId, charId, charName) {
      $scope.data.currentChar = {
        factionId: angular.copy($scope.factionId),
        houseId: houseId,
        charId: charId,
        charName: angular.copy(charName)
      };
    }

  }]);