'use strict';

angular.module('mudApp.mainView')

  .factory('pathFindingService', ['getBind', function(getBind) {

    return {

      initGrid: function(data) {
        var numCols = data.cols * 6,
            numRows = data.rows * 6,
            matrix = this.buildMatrix(data.nodes, data.cols, data.rows);
        this.grid = new PF.Grid(numCols, numRows, matrix);
        console.log(this.grid);
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
            } else if ((k + 1) % 6 === 0 && j % 2 === 0) {
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

      }


    };


  }]);
