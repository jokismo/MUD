'use strict';

// Dependencies
angular.module('mudApp',
    ['mudApp.config'
      , 'mudApp.auth'
      , 'mudApp.mainView'
      , 'firebase'
      , 'ngRoute']
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

  // App Config Check
  .run(['FBURL', function(FBURL) {
    if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
      angular.element(document.body).html('<h1>Config Error</h1>');
    }
  }])

  // Init
  .run(['loginService', '$rootScope', 'FBURL', '$location', function(loginService, $rootScope, FBURL, $location) {
    $rootScope.auth = loginService.init('/login');
    $rootScope.FBURL = FBURL;
    $rootScope.data = {};
    $rootScope.$on('$firebaseAuth:logout', function() {
      $location.path('/login');
    });
  }]);

angular.module('mudApp.config', []);
angular.module('mudApp.firebaseServices', []);
angular.module('mudApp.auth', ['mudApp.firebaseServices']);
angular.module('mudApp.mainView', ['mudApp.firebaseServices']);