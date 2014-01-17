'use strict';

angular.module('mudApp.mainView')

  .controller('CharSelectCtrl', ['$scope', 'getBind', 'charService', 'settingsService', 'firebaseRef', 'presenceService', function($scope, getBind, charService, settingsService, firebaseRef, presenceService) {

    firebaseRef('factions').once('value', function(data) {
      $scope.factions = data.val();
    });
    $scope.charData = {};
    if ($scope.auth.user) {
      $scope.charData = getBind(['users', $scope.auth.user.id, 'houses']);
    } else {
      $scope.$on('loggedIn', function() {
        $scope.charData = getBind(['users', $scope.auth.user.id, 'houses']);
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
      $scope.charCreateUpdate = 'Checking for Duplicate Name';
      var promise = charService.newHouse($scope.newHouse, $scope.auth.user.id);
      promise.then(function() {
        $scope.charCreateUpdate = false;
        $scope.charCreateErr = false;
        $scope.showHouseCreate(false, 'one');
      }, function(reason) {
        $scope.charCreateUpdate = false;
        $scope.charCreateErr = reason;
      }, function(update) {
        $scope.charCreateUpdate = update;
      });
    };

    $scope.selectedChar = function(houseId, charId, charNick, index) {
      $scope.nickName.name = '';
      $scope.nickName.nickCreateErr = false;
      if (charNick !== 'notSet') {
        setCurrentChar(houseId, charId, charNick);
        presenceService.charOnline($scope.data.currentChar);
        var promise = settingsService.getSettings($scope.auth.user.id, $scope.factionId, houseId, charId, $scope.data.isMobile);
        promise.then(function(data) {
          $scope.data.uiSettings = data;
          $scope.$emit('GuiReady');
        });
      } else {
        $scope.createNickIndex = index;
      }
    };

    $scope.createNick = function(houseId, charId) {
      $scope.nickName.nickCreateUpdate = 'Checking for Duplicate Name';
      var promise = charService.createNick($scope.auth.user.id, $scope.factionId, houseId, charId, $scope.nickName.name);
      promise.then(function(uiSettings) {
        setCurrentChar(houseId, charId, $scope.nickName.name);
        $scope.nickName.nickCreateUpdate = false;
        $scope.nickName.nickCreateErr = false;
        $scope.data.uiSettings = angular.copy(uiSettings);
        $scope.$emit('GuiReady');
      }, function(reason) {
        $scope.nickName.nickCreateUpdate = false;
        $scope.nickName.nickCreateErr = reason;
      }, function(deferred) {
        $scope.nickName.nickCreateUpdate = 'Setting up UI';
        settingsService.initUser(deferred, $scope.auth.user.id, $scope.factionId, houseId, charId, $scope.data.isMobile);
      });
    };

    function setCurrentChar(houseId, charId, charName) {
      $scope.data.currentChar = {
        factionId:  angular.copy($scope.factionId),
        houseId: houseId,
        charId: charId,
        charName: angular.copy(charName)
      };
    }

  }]);