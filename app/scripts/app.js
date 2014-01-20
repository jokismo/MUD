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
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'GuiCtrl'
      })
      .when('/admin', {
        templateUrl: 'views/main.html',
        controller: 'GuiCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({redirectTo: '/'});

  }])

  .config(['$tooltipProvider', function ($tooltipProvider) {
    $tooltipProvider.options({
      appendToBody: true
    });
  }])

  // Init
  .run(['authService', '$rootScope', 'FBURL', '$location', '$document', 'presenceService', function(authService, $rootScope, FBURL, $location, $document, presenceService) {
    $rootScope.auth = authService.init();
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
      $location.path('/login');
    });
    $rootScope.$on('$firebaseSimpleLogin:login', function() {
      presenceService.init($rootScope.auth.user.id)
        .then(function(admin) {
          $rootScope.data.isAdmin = admin;
        });
      $location.path('/');
    });
    $rootScope.$on('$routeChangeStart', function(event, next) {
      if (next.templateUrl !== 'views/login.html') {
        presenceService.userIsAuth()
          .then(function() {
            return;
          }, function() {
            $location.path('/login');
          });
      }
    });
  }]);

angular.module('mudApp.config', []);
angular.module('mudApp.firebaseServices', []);
angular.module('mudApp.backendServices', []);
angular.module('mudApp.auth', ['mudApp.firebaseServices']);
angular.module('mudApp.mainView', ['mudApp.firebaseServices']);