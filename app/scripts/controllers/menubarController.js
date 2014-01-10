'use strict';

angular.module('mudApp.mainView')

  .controller('menubarCtrl', ['$scope', 'loginService', 'settingsService', function($scope, loginService, settingsService) {

    $scope.windows = [
      {
        directiveName : 'quests',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Quests'
      },
      {
        directiveName : 'npcs',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Npc Dialogue'
      },
      {
        directiveName : 'chat',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Chat Window'
      },
      {
        directiveName : 'global',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Global Info'
      },
      {
        directiveName : 'char',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Character Info'
      },
      {
        directiveName : 'inv',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Inventory'
      },
      {
        directiveName : 'worldmap',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Map'
      }
    ];

    $scope.toggleWindow = function(win) {
      $scope.data.uiSettings[win].show = !$scope.data.uiSettings[win].show;
    };

  }]);