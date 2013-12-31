(function() {

  'use strict';

  angular.module('mudApp.mainView')

    .factory('settingsService', ['getBind', function(getBind) {

      return {

        init: function(uid) {
          if (this.isMobile) {
            this.link = ['users', uid, 'mobile'];
          } else {
            this.link = ['users', uid, 'browser'];
          }
        },

        isMobile: (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent),

        link: [],

        getSettings: function() {
          return getBind(this.link);
        }

      };
    }]);

})();