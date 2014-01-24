'use strict';

angular.module('mudApp.adminView')

  .factory('adminMapService', ['firebaseBind', 'firebaseRef', '$q', function(firebaseBind, firebaseRef, $q) {

    return {

      loadMap: function(uid, mapName) {
        var mapRef = firebaseBind(['users', uid, 'admin','tempMaps', mapName]);
        var that = this;
        mapRef.$on('loaded', function() {
          that.refreshView.call(that, 3, mapRef);
        });
        return mapRef;
      },

      bindNewMap: function(uid, map) {
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
          transform: 's1.2',
          transformBack: 's1.0'
        },
        pathStyle: {
          stroke: 'yellow',
          'stroke-width': 3
        },
        nodeStyles: {
          normal: {
            fill: '#285e8e',
            'stroke-opacity': 0.3
          },
          blocked: {
            fill: 'false',
            'stroke-opacity': 0.3
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
        var i, j, l, m, rect, path, mainNode, oddRow, createRowTask, paper, mainRow, mainCol, mapCoord, direcs, length, className,
          nodeGrid    = this.nodeGrid,
          numCols     = data.cols * 2 + 1,
          numRows     = data.rows * 2 + 1,
          posX = 0,
          posY = 0,
          pathString = ['M', 'L', 'L', 'L', 'Z'],
          slope = (10.5 / Math.sin(45)),
          offsetA = ((Math.sqrt((slope * slope) - (10.5 * 10.5))) / 3) * nodeSize,
          offsetB = (Math.sqrt((slope * 2 / 3) * (slope * 2 / 3) - 49)) * nodeSize;
        if (typeof this.paper.clear !== 'undefined') {
          this.paper.remove();
        }
        paper = Raphael('worldmapBox', ((offsetB * (numRows - 1)) + offsetA) + ((numCols - 1) * 10 * nodeSize + 5 * nodeSize), (((numRows - 1) * nodeSize * 7) + (3.5 * nodeSize)));
        this.paper = paper;

        createRowTask = function(rowId) {
          nodeGrid[rowId] = [];
          posX = (offsetB * ((numRows - 1) - rowId)) + offsetA;
          oddRow = rowId % 2 !== 0;
          mainRow = (rowId / 2) | 0;
          if (rowId + 1 === numRows) {
            mainRow -= 1;
          }
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
            mainNode = oddRow && (j % 2 !== 0);
            mainCol = (j / 2) | 0;
            if (j + 1 === numCols) {
              mainCol -= 1;
            }
            mapCoord = '';
            className = 'T_';
            if (mainNode) {
              rect.transform('s3');
              className = 'T-' + mainRow + '-' + mainCol + '_';
              rect.node.setAttribute('data-mainNode', 'true');
              rect.node.setAttribute('data-mainRow', mainRow);
              rect.node.setAttribute('data-mainCol', mainCol);
              direcs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
              length = direcs.length;
              for (m = 0; m < length; m++) {
                mapCoord += mainRow + '-' + mainCol + '-' + direcs[m];
                if (m < direcs.length - 1) {
                  mapCoord += '_';
                }
              }
            } else if (rowId === 0) {
              if (j === 0) {
                mapCoord = mainRow + '-' + mainCol + '-' + 'nw';
              } else if (j === numCols - 1) {
                mapCoord = mainRow + '-' + mainCol + '-' + 'ne';
              } else if (j % 2 === 0) {
                mapCoord = mainRow + '-' + mainCol + '-' + 'nw' + '_' + mainRow + '-' + (mainCol - 1) + '-' + 'ne';
              } else {
                mapCoord = mainRow + '-' + mainCol + '-' + 'n';
              }
            } else if (rowId === numRows - 1) {
              if (j === 0) {
                mapCoord = mainRow + '-' + mainCol + '-' + 'sw';
              } else if (j === numCols - 1) {
                mapCoord = mainRow + '-' + mainCol + '-' + 'se';
              } else if (j % 2 === 0) {
                mapCoord = mainRow + '-' + mainCol + '-' + 'sw' + '_' + mainRow + '-' + (mainCol - 1) + '-' + 'se';
              } else {
                mapCoord = mainRow + '-' + mainCol + '-' + 's';
              }
            } else if (j === 0) {
              if (rowId % 2 === 0) {
                mapCoord = (mainRow - 1) + '-' + mainCol + '-' + 'sw' + '_' + mainRow + '-' + mainCol + '-' + 'nw';
              } else {
                mapCoord = mainRow + '-' + mainCol + '-' + 'w';
              }
            } else if (j === numCols - 1) {
              if (rowId % 2 === 0) {
                mapCoord = (mainRow - 1) + '-' + mainCol + '-' + 'se' + '_' + mainRow + '-' + mainCol + '-' + 'ne';
              } else {
                mapCoord = mainRow + '-' + mainCol + '-' + 'e';
              }
            } else {
              if (rowId % 2 === 0) {
                if (j % 2 === 0) {
                  mapCoord = (mainRow - 1) + '-' + (mainCol - 1) + '-' + 'se' + '_' + (mainRow - 1) + '-' + mainCol + '-' + 'sw' + '_' + mainRow + '-' + (mainCol - 1) + '-' + 'ne' + '_' + mainRow + '-' + mainCol + '-' + 'nw';
                } else {
                  mapCoord = (mainRow - 1) + '-' + mainCol + '-' + 's' + '_' + mainRow + '-' + mainCol + '-' + 'n';
                }
              } else {
                mapCoord = mainRow + '-' + (mainCol - 1) + '-' + 'e' + '_' + mainRow + '-' + mainCol + '-' + 'w';
              }
            }
            className += mapCoord;
            rect.node.setAttribute('class', className);
            nodeGrid[rowId].push(rect);
          }
          posY += 7 * nodeSize;
        };

        for (i = 0; i < numRows; ++i) {
          (createRowTask(i));
        }

        this.refreshNodes(data);
      },

      refreshNodes: function(data) {
        var i, j, l, rect, oddRow, evenCol, createRowTask, className,
          nodeGrid    = this.nodeGrid,
          blockedStyle = this.viewStyling.nodeStyles.blocked,
          normalStyle = this.viewStyling.nodeStyles.normal,
          numCols     = data.cols * 2 + 1,
          numRows     = data.rows * 2 + 1,
          k = 0;
        function walkable(rect) {
          rect.attr(normalStyle);
          className = className.substr(1);
          className = 'T' + className;
        }
        createRowTask = function(rowId) {
          oddRow = rowId % 2 !== 0;
          l = 0;
          for (j = 0; j < numCols; ++j) {
            evenCol = j % 2 === 0;
            rect = nodeGrid[rowId][j];
            rect.attr(blockedStyle);
            className = rect.node.getAttribute('class');
            className = className.substr(1);
            className = 'F' + className;
            if (rowId + 1 === numRows) {
              if (!oddRow) {
                if (j + 1 === numCols) {
                  data.nodes[k][l].se === 'c' && walkable(rect);
                } else if (evenCol) {
                  if (j === 0) {
                    data.nodes[k][l].sw === 'c' && walkable(rect);
                  } else {
                    if (data.nodes[k][l].sw === 'c' || data.nodes[k][l-1].se === 'c') {
                      walkable(rect);
                    }
                  }
                } else {
                  data.nodes[k][l].s === 'c' && walkable(rect);
                  if (j + 2 < numCols) {
                    l++;
                  }
                }
              }
            } else {
              if (!oddRow) {
                if (j + 1 === numCols) {
                  data.nodes[k][l].ne === 'c' && walkable(rect);
                } else if (evenCol) {
                  if (j === 0) {
                    data.nodes[k][l].nw === 'c' && walkable(rect);
                  } else {
                    if (data.nodes[k][l].nw === 'c' || data.nodes[k][l-1].ne === 'c') {
                      walkable(rect);
                    }
                  }
                } else {
                  data.nodes[k][l].n === 'c' && walkable(rect);
                  if (j + 2 < numCols) {
                    l++;
                  }
                }
              } else {
                if (j + 1 === numCols) {
                  data.nodes[k][l].e === 'c' && walkable(rect);
                } else if (evenCol) {
                  data.nodes[k][l].w === 'c' && walkable(rect);
                } else {
                  data.nodes[k][l].room && walkable(rect);
                  if (j + 2 < numCols) {
                    l++;
                  }
                }
              }
            }
            rect.node.setAttribute('class', className);
          }
          if (oddRow && (rowId + 2 !== numRows)) {
            k++;
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
      },

      findChanges: function(rows, cols, row, col, newVal) {
        var direc;

        switch(newVal) {
          case 'n':
            if (row === '0') {
              return false;
            } else {
              row--;
              direc = 's';
            }
            break;
          case 's':
            if (row === rows - 1) {
              return false;
            } else {
              row++;
              direc = 'n';
            }
            break;
          case 'e':
            if (col === cols - 1) {
              return false;
            } else {
              col++;
              direc = 'w';
            }
            break;
          case 'w':
            if (col === cols - 1) {
              return false;
            } else {
              col--;
              direc = 'e';
            }
            break;
          case 'nw':
            if (col === '0' || row === '0') {
              return false;
            } else {
              col--;
              row--;
              direc = 'se';
            }
            break;
          case 'ne':
            if (col === cols - 1 || row === '0') {
              return false;
            } else {
              col++;
              row--;
              direc = 'sw';
            }
            break;
          case 'sw':
            if (col === '0' || row === rows - 1) {
              return false;
            } else {
              col--;
              row++;
              direc = 'ne';
            }
            break;
          case 'se':
            if (col === cols - 1 || row === rows - 1) {
              return false;
            } else {
              col++;
              row++;
              direc = 'nw';
            }
            break;
        }

        return [row, col, direc];

      }
    };
  }]);
