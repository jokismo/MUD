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
              scope.data.uiSettings[elemName].sizeX = ui.size.width;
              scope.data.uiSettings[elemName].sizeY = ui.size.height;
            });
          }
        };
        scope.$on('loadGui', function() {
          element.resizable(options);
          scope.$watch('data.uiSettings.guiSettings.resizable', function() {
            if (scope.data.uiSettings.guiSettings.resizable) {
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
              scope.data.uiSettings[elemName].posX = ui.offset.left;
              scope.data.uiSettings[elemName].posY = ui.offset.top;
            });
          }
        };
        scope.$on('loadGui', function() {
          element.draggable(options);
          scope.$watch('data.uiSettings.guiSettings.draggable', function() {
            if (scope.data.uiSettings.guiSettings.draggable) {
              element.draggable("enable");
            } else {
              element.draggable("disable");
            }
          });
          scope.$watch('data.uiSettings.guisettings.snap', function() {
            element.draggable('option', 'snap', scope.data.uiSettings.guiSettings.snap);
          });
        });
      }
    };
  })

  .directive('loadSize', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$on('loadGui', function() {
          var elemName = element.prop("tagName").toLowerCase();
          element.css({
            'width' : scope.data.uiSettings[elemName].sizeX + 'px',
            'height' : scope.data.uiSettings[elemName].sizeY + 'px'
          });
        });
      }
    };
  })

  .directive('loadPosition', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$on('loadGui', function() {
          var elemName = element.prop("tagName").toLowerCase();
          if (scope.data.uiSettings[elemName].posX === 'init') {
            var windowWidth = window.innerWidth;
            var elemWidth = element.width();
            console.log(elemWidth);
            scope.data.uiSettings[elemName].posX = (windowWidth / 2) - (elemWidth / 2);
          }
          element.css({
            'left' : scope.data.uiSettings[elemName].posX,
            'top' : scope.data.uiSettings[elemName].posY
          });
        });
      }
    };
  });
