'use strict';

angular.module('mudApp.mainView')

  .directive('flexible', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        attrs.$observe('flexible', function(cols) {
          var editing,
              resizeCol = function() {
                element.css({
                  'width' : window.innerWidth - 300 * ( cols[0] - 1 ) + 'px',
                  'left' : '300px'
                });
              };
          cols = cols.split(" ");
          editing = (cols[1] === "true");
          if (cols.length > 1 && !editing) {
            resizeCol();
            window.addEventListener('resize', resizeCol, true);
          }
        });
      }
    };
  })

  .directive('resizable', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.resizable();
        attr.$observe('resizable', function(resizable) {
          if (resizable === "true") {
            element.resizable();
          } else {
            element.resizable("disable");
          }
        });
      }
    };
  })

  .directive('keybinding', function () {
    return {
      restrict: 'E',
      scope: {
        invoke: '&'
      },
      link: function (scope, el, attr) {
        Mousetrap.bind(attr.on, scope.invoke);
      }
    };
  });