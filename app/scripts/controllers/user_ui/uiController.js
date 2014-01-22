'use strict';

angular.module('mudApp.mainView')

  .controller('UiCtrl', ['$scope', function($scope) {

    $scope.guiData = {};
    $scope.guiData.charSelect = {
      done: false
    };

    Mousetrap.bind('esc', showHeader);

    function showHeader() {
      $scope.$apply(function() {
        $scope.guiData.showHeader = !$scope.guiData.showHeader;
      });
    }

    $scope.$on('GuiReady', function(event) {
      event.stopPropagation();
      $scope.guiData.charSelect = {
        done: true,
        charSelect: true,
        charCreate: false
      };
      $scope.$broadcast('loadGui');

    });

  }]);