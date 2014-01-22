'use strict';

angular.module('mudApp.adminView')

  .controller('UsersCtrl', ['$scope', 'usersService', 'uiSettingsService', function($scope, usersService, uiSettingsService) {

    $scope.newAdmin = {};


    $scope.createAdmin = function() {
      var exists = false;
      usersService.newAdmin($scope.newAdmin.userId, $scope.newAdmin.isSuper)
        .then(function() {
          $scope.$emit('emitMsg', { msg: 'Admin Update Complete'});
          if (!exists) {
            uiSettingsService.initAdmin($scope.newAdmin.userId)
              .then(function() {
                $scope.$emit('emitMsg', { msg: 'New Admin Settings Complete'});
              }, function(err) {
                $scope.$emit('emitMsg', { msg: err});
              });
          }
        }, function(err) {
          $scope.$emit('emitMsg', { msg: err});
        }, function(found) {
          exists = found;
          $scope.$emit('emitMsg', { msg: 'Admin Exists'});
        });

    };

  }]);


