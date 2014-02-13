'use strict';

angular.module('mudApp.adminView')

  .controller('NpcEditorCtrl', ['$scope', 'npcService', function($scope, npcService) {

    var mapIsTemp;

    $scope.newNpc = {
      show: false,
      editing: false,
      actionCount: 0,
      actions: {
        Combat: [],
        Idle: [],
        Engage: []
      }
    };
    $scope.pathTypes = ['Static', 'Path', 'Random', 'Circle'];
    $scope.actionTypes = ['say', 'yell', 'gesture'];
    $scope.actionStates = ['Idle', 'Combat', 'Engage'];

    $scope.addAction = function() {
      if (typeof $scope.newNpc.actionState !== 'undefined' && typeof $scope.newNpc.actionType !== 'undefined' && typeof $scope.newNpc.action !== 'undefined') {
        ++$scope.newNpc.actionCount;
        $scope.newNpc.actions[$scope.newNpc.actionState].push({
          type: $scope.newNpc.actionType,
          action:  $scope.newNpc.action});
        $scope.newNpc.actionState = '';
        $scope.newNpc.actionType = '';
        $scope.newNpc.action = '';
      }
    };

    $scope.showCreateNpc = function(show) {
      $scope.newNpc.show = show;
      if (!show) {
        $scope.setLoc(false);
      } else {
        $scope.setLoc(true);
      }
    };

    $scope.createNpc = function() {
     if ($scope.dataForNpc.nodeArray.length === 0) {
       $scope.err = 'NPC Loc Not Set';
     } else {
       $scope.newNpc.nodes = angular.copy($scope.dataForNpc.nodeArray);
       $scope.setLoc(false);
     }
    };

    $scope.setLoc = function(start) {
      if (start) {
        $scope.$emit('setNpcLoc', true);
        $scope.newNpc.editing = true;
      } else {
        $scope.dataForNpc.nodeArray = [];
        if ($scope.newNpc.editing) {
          $scope.$emit('setNpcLoc', false);
        }
        $scope.newNpc.editing = false;
      }
    };

    $scope.$on('mapLoaded', function(event, mapName, isTemp) {
      mapIsTemp = isTemp;
      if (mapIsTemp) {
        npcService.getData($scope.auth.user.id, mapName)
          .then(function(data) {
            $scope.npcData = data.npcBind;
            $scope.factions = data.factions;
            $scope.races = data.races;
            $scope.classes = data.classes;

          });
      }
    });

  }]);