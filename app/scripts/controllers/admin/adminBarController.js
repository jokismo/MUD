'use strict';

angular.module('mudApp.adminView')

  .controller('AdminBarCtrl', ['$scope', function($scope) {

    $scope.windows = [
      {
        directiveName : 'users',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Users'
      },
      {
        directiveName : 'mapeditor',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Map Editor'
      },
      {
        directiveName : 'gamestatus',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Game Status'
      },
      {
        directiveName : 'adminmap',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Map'
      },
      {
        directiveName : 'console',
        display: 'glyphicon glyphicon-star',
        tooltip: 'Console'
      }
    ];

    $scope.toggleWindow = function(win) {
      $scope.data.uiSettings[win].show = !$scope.data.uiSettings[win].show;
    };

  }]);