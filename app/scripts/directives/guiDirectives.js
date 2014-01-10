'use strict';

angular.module('mudApp.mainView')

  .directive('resizable', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var elemName = element.prop("tagName").toLowerCase(),
          options = {
          handles: "all",
          containment: "document",
          stop: function(event, ui) {
            scope.$apply(function() {
              scope.data.uiSettings[elemName].sizex = ui.size.width;
              scope.data.uiSettings[elemName].sizey = ui.size.height;
            });
          }
        };
        scope.$on('loadGui', function() {
          element.resizable(options);
          scope.$watch('data.uiSettings.guisettings.resizable', function() {
            if (scope.data.uiSettings.guisettings.resizable) {
              element.resizable("enable");
            } else {
              element.resizable("disable");
            }
          });
        });
      }
    };
  })

  .directive('draggable', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var elemName = element.prop("tagName").toLowerCase(),
          options = {
          snap: true,
          containment: "document",
          stop: function(event, ui) {
            scope.$apply(function() {
              scope.data.uiSettings[elemName].posx = ui.offset.left;
              scope.data.uiSettings[elemName].posy = ui.offset.top;
            });
          }
        };
        scope.$on('loadGui', function() {
          element.draggable(options);
          scope.$watch('data.uiSettings.guisettings.draggable', function() {
            if (scope.data.uiSettings.guisettings.draggable) {
              element.draggable("enable");
            } else {
              element.draggable("disable");
            }
          });
          scope.$watch('data.uiSettings.guisettings.snap', function() {
            element.draggable('option', 'snap', scope.data.uiSettings.guisettings.snap);
          });
        });
      }
    };
  })

  .directive('loadSettings', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$on('loadGui', function() {
          var elemName = element.prop("tagName").toLowerCase();
          element.css({
            'width' : scope.data.uiSettings[elemName].sizex + 'px',
            'height' : scope.data.uiSettings[elemName].sizey + 'px',
            'left' : scope.data.uiSettings[elemName].posx,
            'top' : scope.data.uiSettings[elemName].posy
          });
        });
      }
    };
  });
