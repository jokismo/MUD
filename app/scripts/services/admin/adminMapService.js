'use strict';

angular.module('mudApp.adminView')

  .factory('adminMapService', ['firebaseBind', 'firebaseRef', '$q', function(firebaseBind, firebaseRef, $q) {

    return {

      test: function(data) {
        console.log(data);
      },

      bindTempMap: function(uid, map) {
        var paper = this.paper;
        var link = ['users', uid, 'admin','tempMaps', map.name];
        var deferred = $q.defer();
        firebaseRef(link).transaction(function(currentData) {
          if (currentData === null) {
            return map;
          } else {
            paper.remove();
            deferred.reject(map.name + ' name is taken.');
          }
        }, function(error, committed) {
          if (error) {
            deferred.reject(error);
          }
          if (committed && !error) {
            deferred.resolve(firebaseBind(link));
          }
        });
        return deferred.promise;
      },

      getMapList: function(uid) {
        return firebaseRef(['users', uid, 'admin', 'tempMaps']);
      },

      getRegions: function() {
        return firebaseRef(['regions']);
      },

      paper: {},
      nodeGrid: [],
      viewStyling: {
        nodeColorizeEffect: {
          duration: 50
        },
        nodeZoomEffect: {
          duration: 200,
          transform: 's1.2', // scale by 1.2x
          transformBack: 's1.0'
        },
        pathStyle: {
          stroke: 'yellow',
          'stroke-width': 3
        },
        supportedOperations: ['opened', 'closed', 'tested'],
        nodeStyles: {
          normal: {
            fill: '#285e8e',
            'stroke-opacity': 0.3
          },
          blocked: {
            fill: 'false',
            'stroke-opacity': 0.2
          },
          start: {
            fill: '#0d0',
            'stroke-opacity': 0.2
          },
          end: {
            fill: '#e40',
            'stroke-opacity': 0.2
          },
          opened: {
            fill: '#98fb98',
            'stroke-opacity': 0.2
          },
          closed: {
            fill: '#afeeee',
            'stroke-opacity': 0.2
          },
          failed: {
            fill: '#ff8888',
            'stroke-opacity': 0.2
          },
          tested: {
            fill: '#e5e5e5',
            'stroke-opacity': 0.2
          }
        }
      },

      initData: function(rows, cols, region, mapName) {
        var mapData = {
          nodes: {},
          rows: rows,
          cols: cols,
          name: mapName,
          region: region
        };
        var deferred = $q.defer();
        var i, j;

        for (i = 0; i < rows; i++) {
          mapData.nodes[i] = {};
          for (j = 0; j < cols; j++) {
            mapData.nodes[i][j] = {
              room: true,
              n: 'c',
              s: 'c',
              w: 'c',
              e: 'c',
              nw: 'c',
              ne: 'c',
              sw: 'c',
              se: 'c'
            };
          }
        }

        this.refreshView(3, mapData);
        deferred.resolve(mapData);
        return deferred.promise;
      },

      refreshView: function(nodeSize, data) {
        var i, j, l, rect, path, mainNode, oddRow, evenCol, createRowTask, paper,
          normalStyle = this.viewStyling.nodeStyles.normal,
          nodeGrid    = this.nodeGrid,
          numCols     = data.cols * 2 + 1,
          numRows     = data.rows * 2 + 1,
          posX = 0,
          posY = 0,
          k = 0,
          pathString = ['M', 'L', 'L', 'L', 'Z'],
          slope = (10.5 / Math.sin(45)),
          offsetA = ((Math.sqrt((slope * slope) - (10.5 * 10.5))) / 3) * nodeSize,
          offsetB = (Math.sqrt((slope * 2 / 3) * (slope * 2 / 3) - 49)) * nodeSize;
        if (typeof this.paper.clear !== 'undefined') {
          this.paper.remove();
        }
        paper = Raphael('worldmapBox', ((offsetB * (numRows - 1)) + offsetA) + ((numCols - 1) * 10 * nodeSize + 5 * nodeSize), (((numRows - 1) * nodeSize * 7) + (3.5 * nodeSize)));

        createRowTask = function(rowId) {

          nodeGrid[rowId] = [];
          posX = (offsetB * ((numRows - 1) - rowId)) + offsetA;
          oddRow = rowId % 2 !== 0;
          l = 0;

          for (j = 0; j < numCols; ++j) {

            path = "";
            path += pathString[0] + posX + ',' + posY;
            posX += 5 * nodeSize;
            path += pathString[1] + posX + ',' + posY;
            posX -= offsetA;
            posY += 3.5 * nodeSize;
            path += pathString[2] + posX + ',' + posY;
            posX -= 5 * nodeSize;
            path += pathString[3] + posX + ',' + posY + pathString[4];
            posY -= 3.5 * nodeSize;
            posX += 10 * nodeSize + offsetA;

            rect = paper.path(path);
            rect.attr(normalStyle);
            rect.node.setAttribute('data-mapRow', rowId);
            rect.node.setAttribute('data-mapCol', j);
            rect.node.setAttribute('data-walkable', true);

            evenCol = j % 2 === 0;
            mainNode = oddRow && (j % 2 !== 0);

            if (mainNode) {
              rect.transform('s3');
              rect.node.setAttribute('data-mainNode', true);
            }

            rect.hide();
            if (rowId + 1 === numRows) {
              if (!oddRow) {
                if (j + 1 === numCols) {
                  data.nodes[k][l].se && rect.show();
                } else if (evenCol) {
                  if (j === 0) {
                    data.nodes[k][l].sw && rect.show();
                  } else {
                    if (data.nodes[k][l].sw || data.nodes[k][l-1].se) {
                      rect.show();
                    }
                  }
                } else {
                  data.nodes[k][l].s && rect.show();
                  if (j + 2 < numCols) {
                    l++;
                  }
                }
              }
            } else {
              if (!oddRow) {
                if (j + 1 === numCols) {
                  data.nodes[k][l].ne && rect.show();
                } else if (evenCol) {
                  if (j === 0) {
                    data.nodes[k][l].nw && rect.show();
                  } else {
                    if (data.nodes[k][l].nw || data.nodes[k][l-1].ne) {
                      rect.show();
                    }
                  }
                } else {
                  data.nodes[k][l].n && rect.show();
                  if (j + 2 < numCols) {
                    l++;
                  }
                }
              } else {
                if (j + 1 === numCols) {
                  data.nodes[k][l].e && rect.show();
                } else if (evenCol) {
                  data.nodes[k][l].w && rect.show();
                } else {
                  data.nodes[k][l].room && rect.show();
                  if (j + 2 < numCols) {
                    l++;
                  }
                }
              }
            }

            nodeGrid[rowId].push(rect);
          }

          posY += 7 * nodeSize;
          if (oddRow && (rowId + 2 !== numRows)) {
            k++;
          }
        };

        for (i = 0; i < numRows; ++i) {
          (createRowTask(i));
        }

        this.paper = paper;
      },

      colorizeNode: function(node, color) {
        node.animate({
          fill: color
        }, this.viewStyling.nodeColorizeEffect.duration);
      }
    };
  }]);
