'use strict';

// Dependencies
angular.module('mudApp',
    ['mudApp.config'
      , 'mudApp.auth'
      , 'mudApp.mainView'
      , 'mudApp.backendServices'
      , 'firebase'
      , 'ngRoute'
      , 'ngResource'
      , 'ui.bootstrap']
  )

  // Views Config
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'GuiCtrl'
    });

    $routeProvider.when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    });

    $routeProvider.otherwise({redirectTo: '/'});
  }])

  .config(['$tooltipProvider', function ($tooltipProvider) {
    $tooltipProvider.options({
      appendToBody: true
    });
  }])

  // Init
  .run(['loginService', '$rootScope', 'FBURL', '$location', '$document', 'presenceService', function(loginService, $rootScope, FBURL, $location, $document, presenceService) {
    $rootScope.auth = loginService.init();
    $rootScope.FBURL = FBURL;
    $rootScope.data = {
      uiSettings: {},
      isMobile: (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent)
    };
    // Prevent Select
    $document.bind('selectstart', function(event) {
      event.preventDefault();
    });
    // Auth Related
    $rootScope.$on('$firebaseSimpleLogin:logout', function() {
      presenceService.isAuth(false);
      $location.url('/login');
    });
    $rootScope.$on('$firebaseSimpleLogin:login', function() {
      presenceService.init($rootScope.auth.user.id);
      $location.url('/');
    });
    $rootScope.$on('$routeChangeStart', function(event, next) {
      if (!presenceService.userAuth && next.templateUrl !== 'views/login.html') {
        $location.path('/login');
      }
    });
  }]);

angular.module('mudApp.config', []);
angular.module('mudApp.firebaseServices', []);
angular.module('mudApp.backendServices', []);
angular.module('mudApp.auth', ['mudApp.firebaseServices']);
angular.module('mudApp.mainView', ['mudApp.firebaseServices']);