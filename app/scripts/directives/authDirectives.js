angular.module('mudApp.auth')

/**
 * A directive that hides the element from view until waitForAuth resolves
 */
  .directive('ngCloakAuth', function(waitForAuth) {
    return {
      restrict: 'A',
      compile: function(el) {
        el.addClass('hide');
        waitForAuth.then(function() {
          el.removeClass('hide');
        })
      }
    }
  })

/**
 * A directive that shows elements only when the given authentication state is in effect
 */
  .directive('ngShowAuth', function($rootScope) {
    var loginState;
    return {
      restrict: 'A',
      compile: function(el, attr) {
        var expState = attr.ngShowAuth;
        function fn(newState) {
          loginState = newState;
          el.toggleClass('hide', loginState !== expState );
        }
        fn(null);
        $rootScope.$on("$firebaseAuth:login",  function() { fn('login') });
        $rootScope.$on("$firebaseAuth:logout", function() { fn('logout') });
        $rootScope.$on("$firebaseAuth:error",  function() { fn('error') });
      }
    }
  });