'use strict';

angular.module('mudApp.adminView')

  .factory('nodeMapService', ['$q', function($q) {

    return {

      paper: {},
      nodeGrid: [],
      viewStyling: {
        nodeColorizeEffect: {
          duration: 50
        },
        nodeZoomEffect: {
          duration: 200,
          transform: 's1.2',
          transformBack: 's1.0'
        },
        pathStyle: {
          stroke: 'yellow',
          'stroke-width': 3
        },
        nodeStyles: {
          a: {
            fill: 'false',
            'stroke-opacity': 0.3
          },
          b: {
            fill: 'blue',
            'stroke-opacity': 0.3
          },
          c: {
            fill: 'brown',
            'stroke-opacity': 0.3
          },
          d: {
            fill: 'white',
            'stroke-opacity': 0.3
          }
        }
      },

      refreshView: function(nodeSize, data) {
        var i, j, rect, path, createRowTask, paper, className,
          nodeGrid    = this.nodeGrid,
          numCols     = data.cols,
          numRows     = data.rows,
          posX = 0,
          posY = 0,
          pathString = ['M', 'L', 'L', 'L', 'Z'],
          slope = (10.5 / Math.sin(45)),
          offsetA = (Math.sqrt((slope * slope) - (10.5 * 10.5))) * nodeSize;
        if (typeof this.paper.clear !== 'undefined') {
          this.paper.remove();
        }
        paper = Raphael('nodemapBox', ((numCols * 15) * nodeSize) + (offsetA * numCols), 10.5 * numCols * nodeSize);
        this.paper = paper;

        createRowTask = function(rowId) {
          nodeGrid[rowId] = [];
          posX = (numRows - rowId) * offsetA;
          for (j = 0; j < numCols; ++j) {
            path = "";
            path += pathString[0] + posX + ',' + posY;
            posX += 15 * nodeSize;
            path += pathString[1] + posX + ',' + posY;
            posX -= offsetA;
            posY += 10.5 * nodeSize;
            path += pathString[2] + posX + ',' + posY;
            posX -= 15 * nodeSize;
            path += pathString[3] + posX + ',' + posY + pathString[4];
            posY -= 10.5 * nodeSize;
            posX += 15 * nodeSize + offsetA;
            rect = paper.path(path);
            className = rowId + ',' + j;
            rect.node.setAttribute('class', className);
            nodeGrid[rowId].push(rect);
          }
          posY += 10.5 * nodeSize;
        };

        for (i = 0; i < numRows; ++i) {
          (createRowTask(i));
        }
        this.refreshNodes(data);
      },

      simpleRefresh: function(array, state) {
        this.nodeGrid[array[0]][array[1]].attr(this.viewStyling.nodeStyles[state]);
      },

      refreshNodes: function(data) {
        var i, j, rect, createRowTask,
          nodeGrid    = this.nodeGrid,
          styles = this.viewStyling.nodeStyles,
          numCols     = data.cols,
          numRows     = data.rows;
        createRowTask = function(rowId) {
          for (j = 0; j < numCols; ++j) {
            rect = nodeGrid[rowId][j];
            rect.attr(styles[data.roomMap[rowId][j]]);
          }
        };
        for (i = 0; i < numRows; ++i) {
          (createRowTask(i));
        }
      },

      colorizeNode: function(node, color) {
        node.animate({
          fill: color
        }, this.viewStyling.nodeColorizeEffect.duration);
      }
    };
  }]);
