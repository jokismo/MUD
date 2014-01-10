'use strict';

// Dependencies
angular.module('mudApp',
    ['mudApp.config'
      , 'mudApp.auth'
      , 'mudApp.mainView'
      , 'firebase'
      , 'ngRoute'
      , 'ui.bootstrap']
  )

  // Views Config
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      authRequired: true,
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
  .run(['loginService', '$rootScope', 'FBURL', '$location', '$document', function(loginService, $rootScope, FBURL, $location, $document) {
    $rootScope.auth = loginService.init('/login');
    $rootScope.FBURL = FBURL;
    $rootScope.data = {
      uiSettings: {},
      reloadUi: true
    };
    // Prevent Select
    $document.bind('selectstart', function(event) {
      event.preventDefault();
    });
    // Reload app at logout to clear binding
    $rootScope.$on('$firebaseAuth:logout', function() {
      $location.url('/login');
    });
  }]);

angular.module('mudApp.config', []);
angular.module('mudApp.firebaseServices', []);
angular.module('mudApp.auth', ['mudApp.firebaseServices']);
angular.module('mudApp.mainView', ['mudApp.firebaseServices']);