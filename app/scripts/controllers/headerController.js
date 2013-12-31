'use strict';

angular.module('mudApp.mainView')

  .controller('HeaderCtrl', ['$scope', 'loginService', '$location', function($scope, loginService, $location) {

    $scope.logout = function() {
      loginService.logout('/login');
    }

}]);