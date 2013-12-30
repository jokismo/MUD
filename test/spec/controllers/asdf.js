'use strict';

describe('Controller: AsdfCtrl', function () {

  // load the controller's module
  beforeEach(module('mudApp'));

  var AsdfCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AsdfCtrl = $controller('AsdfCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
