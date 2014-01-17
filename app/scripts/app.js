'use strict';

// Dependencies
angular.module('mudApp',
    ['mudApp.config'
      , 'mudApp.auth'
      , 'mudApp.mainView'
      , 'mudApp.backendServices'
      , 'firebase'
      , 'ngRoute'
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

  // App Config Check
  .run(['FBURL', function(FBURL) {
    if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
      angular.element(document.body).html('<h1>Config Error</h1>');
    }
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

    $rootScope.$on('$firebaseSimpleLogin:logout', function() {
      $rootScope.data.uiSettings = {};
      $location.url('/login');
    });
    $rootScope.$on('$firebaseSimpleLogin:login', function() {
      $rootScope.$broadcast('loggedIn');
      presenceService.init($rootScope.auth.user.id);
    });
  }]);

angular.module('mudApp.config', []);
angular.module('mudApp.firebaseServices', []);
angular.module('mudApp.backendServices', []);
angular.module('mudApp.auth', ['mudApp.firebaseServices']);
angular.module('mudApp.mainView', ['mudApp.firebaseServices']);