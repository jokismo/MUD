(function() {

  'use strict';

  angular.module('mudApp.firebaseServices')

    .factory('firebaseRef', ['Firebase', 'FBURL', function(Firebase, FBURL) {

      return function() {
        return new Firebase(pathRef([FBURL].concat(Array.prototype.slice.call(arguments))));
      };
    }])

    .factory('firebaseBind', ['$firebase', 'firebaseRef', function($firebase, firebaseRef) {

      return function(path, limit) {
        var ref = firebaseRef(path);
        limit && (ref = ref.limit(limit));
        return $firebase(ref);
      };
    }]);

  function pathRef(args) {
    for(var i=0; i < args.length; i++) {
      if( typeof(args[i]) === 'object' ) {
        args[i] = pathRef(args[i]);
      }
    }
    return args.join('/');
  }

})();