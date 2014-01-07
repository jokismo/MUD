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
        tooltip: 'Quests'
      },
      {
        directiveName : 'chat',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Quests'
      },
      {
        directiveName : 'chat',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Quests'
      }
    ];

    $scope.toggleWindow = function(win) {
      $scope.data.uiSettings[win].show = !$scope.data.uiSettings[win].show;
    };

  }]);