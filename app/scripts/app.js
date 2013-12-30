'use strict';

// Dependencies
angular.module('mudApp',
    ['mudApp.config'
      , 'mudApp.auth'
      , 'firebase'
      , 'ngRoute']
  )

  // Views Config
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      authRequired: true,
      templateUrl: 'views/main.html'
    });

    $routeProvider.when('/login', {
      templateUrl: 'views/login.html'
    });

    $routeProvider.otherwise({redirectTo: '/login'});
  }])

  // App Config Check
  .run(['FBURL', function(FBURL) {
    if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
      angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
    }
  }])

  // Auth Init
  .run(['loginService', '$rootScope', 'FBURL', function(loginService, $rootScope, FBURL) {
    $rootScope.auth = loginService.init('/login');
    $rootScope.FBURL = FBURL;
  }]);

angular.module('mudApp.config', []);
angular.module('mudApp.auth', []);