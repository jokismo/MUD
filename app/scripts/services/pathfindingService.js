'use strict';

angular.module('mudApp.mainView')

  .factory('pathFindingService', ['getBind', '$q', function(getBind, $q) {

    return {

      initGrid: function(data) {
        this.buildMatrix(data.nodes, data.cols, data.rows);
        this.finder = new PF.AStarFinder({
          allowDiagonal: true,
          dontCrossCorners: true
        });
      },

      setWalkableAt: function(gridX, gridY, walkable) {
        this.grid.setWalkableAt(gridX, gridY, walkable);
      },

      buildMatrix : function(nodes, cols, rows) {
        /*
         ▄ ▄ ▄ ▄ ▄   ▄ ▄ ▄ ▄ ▄   This is the Grid: Squares = walls, x = node
         ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄
         ▄ ▄ x ▄ ▄   ▄ ▄ x ▄ ▄
         ▄ ▄     ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄
         ▄ ▄ ▄       ▄ ▄ ▄ ▄ ▄
           ▄   ▄ Diag  ▄   ▄
         ▄ ▄ ▄ ▄ ▄       ▄ ▄ ▄
         ▄ ▄ ▄ ▄ ▄ ▄ ▄     ▄ ▄ ▄
         ▄ ▄ x Open Path x ▄ ▄
         ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄ ▄
           ▄   ▄       ▄   ▄
        */
        var matrix = [],
          i, j, k, m, l, length,
          startC = 2,
          startR = 2,
          numRows = rows * 6,
          numCols = cols * 6;

        for (j = 0; j < numRows; ++j) {
          matrix[j] = [];
          for (k = 0; k < numCols; ++k) {
            if ((j + 1) % 6 === 0) {
              if ((k + 1) % 6 === 0) {
                isWalkable([[j,k]], 0);
              } else if (k % 2 === 0) {
                isWalkable([[j,k]], 0);
              } else {
                isWalkable([[j,k]], 1);
              }
            } else if ((j + 1) % 3 === 0) {
              if ((k + 1) % 3 === 0) {
                isWalkable([[j,k]], 0);
              } else {
                isWalkable([[j,k]], 1);
              }
            } else if ((k + 1) % 6 === 0 && (j % 6 === 0 || (j - 2) % 6 === 0)) {
              isWalkable([[j,k]], 0);
            } else {
              isWalkable([[j,k]], 1);
            }
          }
        }

        function isWalkable(x, walkable) {
          length = x.length;
          for (l = 0; l < length; ++l) {
            matrix[x[l][0]][x[l][1]] = walkable;
          }
        }

        function setWalkableTask(nodeR, nodeC) {

          if (nodes[nodeR][nodeC].room) {
            if (nodes[nodeR][nodeC].n) {
              isWalkable([[startR - 1, startC],[startR - 2, startC]], 0);
            }
            if (nodes[nodeR][nodeC].s) {
              isWalkable([[startR + 1, startC],[startR + 2, startC]], 0);
            }
            if (nodes[nodeR][nodeC].w) {
              isWalkable([[startR, startC - 1],[startR, startC - 2]], 0);
            }
            if (nodes[nodeR][nodeC].e) {
              isWalkable([[startR, startC + 1],[startR, startC + 2]], 0);
            }
            if (nodes[nodeR][nodeC].ne) {
              isWalkable([[startR - 1, startC],[startR - 1, startC + 1],[startR - 2, startC + 1],[startR - 2, startC + 2]], 0);
            }
            if (nodes[nodeR][nodeC].se) {
              isWalkable([[startR + 1, startC],[startR + 1, startC + 1],[startR + 2, startC + 1],[startR + 2, startC + 2]], 0);
            }
            if (nodes[nodeR][nodeC].nw) {
              isWalkable([[startR - 1, startC],[startR - 1, startC - 1],[startR - 2, startC - 1],[startR - 2, startC - 2]], 0);
            }
            if (nodes[nodeR][nodeC].sw) {
              isWalkable([[startR + 1, startC],[startR + 1, startC - 1],[startR + 2, startC - 1],[startR + 2, startC - 2]], 0);
            }
          }

          if ((nodeC + 1) % cols === 0) {
            startC = 2;
          } else {
            startC += 6;
          }
        }

        for (i = 0; i < rows; ++i) {
          for (m = 0; m < cols; ++m) {
            setWalkableTask(i,m);
          }
          startR += 6;
        }
        this.grid = new PF.Grid(numCols, numRows, matrix);
      },

      pathFind: function(start, end) {
        var startCoords, endCoords, gridCopy, path,
          deferred = $q.defer();
        startCoords = this.mapCoordsToMatrix(start);
        endCoords = this.mapCoordsToMatrix(end);
        gridCopy = this.grid.clone();
        path = this.finder.findPath(startCoords[1], startCoords[0], endCoords[1], endCoords[0], gridCopy);
        this.pathToMapCoords(path, deferred);
        return deferred.promise;
      },

      mapCoordsToMatrix: function(mapArray) {
        var modifiedCoords = [];
        mapArray.forEach(function(val, ind, arr) {
          modifiedCoords[ind] = 2 + (6 * ((arr[ind] - 1) / 2));
        });
        return modifiedCoords;
      },

      pathToMapCoords: function(path, promise) {
        var mapArray = [], isMain, straight, lastNode, index,
          i = 0,
          lastCoordIsMain = true;

        function isStraightPath(to, from) {
          var straightPath = {
            isStraight: false,
            value: []
          };
          straightPath.value[0] = to[0];
          straightPath.value[1] = to[1];
          if (to[1] === from[1]) {
            straightPath.isStraight = true;
            straightPath.value[0] += to[0] - from[0];
          } else if (to[0] === from[0]) {
            straightPath.isStraight = true;
            straightPath.value[1] += to[1] - from[1];
          }
          return straightPath;
        }

        function diagVal(to, from) {
          var dirX = -1,
            dirY = -1,
            newVal = [];

          if (to[0] - from[0] > 0) {
            dirX = 1;
          }
          if (to[1] - from[1] > 0) {
            dirY = 1;
          }
          newVal[0] = to[0] + dirX * 3;
          newVal[1] = to[1] + dirY * 3;

          return newVal;
        }

        function toMapCoord(val) {

          var newVal = [];
          newVal[0] = (val[0] - ((val[0] - 2) / 3)) / 2;
          newVal[1] = (val[1] - ((val[1] - 2) / 3)) / 2;
          return newVal;
        }

        path.forEach(function(val, ind, arr) {
          if ((val[0] + 1) % 3 === 0 && (val[1] + 1) % 3 === 0) {
            isMain = ((val[1] + 4) % 6 === 0) && ((val[0] + 1) % 6 !== 0);
            if (!isMain && !lastCoordIsMain) {
              lastNode = mapArray[i-1];
              index = arr.indexOf(lastNode);
              straight = isStraightPath(lastNode, arr[index - 3]);
              if (straight.isStraight) {
                mapArray.push(straight.value);
                i++;
              } else {
                mapArray.push(diagVal(lastNode, arr[index - 2]));
                i++;
              }
            } else {
              lastCoordIsMain = isMain;
            }
            i++;
            mapArray.push(val);
          }
        });


        mapArray.forEach(function(val, ind) {
          var newVal = toMapCoord(val);
          mapArray[ind] = newVal;
        });

        promise.resolve(mapArray);
      }


    };


  }]);
