'use strict';

angular.module('mudApp.adminView')

  .factory('adminMapService', ['firebaseBind', 'firebaseRef', '$q', function(firebaseBind, firebaseRef, $q) {

    return {

      loadMap: function(uid, mapName) {
        var mapBind = firebaseBind(['users', uid, 'admin','tempMaps', mapName]);
        var mapRef =  firebaseRef(['users', uid, 'admin','tempMaps', mapName]);
        var that = this;
        var sendData = {
          deferred: $q.defer(),
          mapBind: mapBind
        };
        var deferred = $q.defer();
        mapRef.once('value', function(data) {
          that.refreshView.call(that, 3, data.val(), sendData);
        }, function(err) {
          deferred.reject(err);
        });
        return sendData.deferred.promise;
      },

      bindNewMap: function(uid, map) {
        var paper = this.paper;
        var link = ['users', uid, 'admin','tempMaps', map.name];
        var mapList = firebaseRef(['users', uid, 'admin','tempMaps', 'mapList']);
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
            mapList.push(map.name);
            deferred.resolve(firebaseBind(link));
          }
        });
        return deferred.promise;
      },

      getMapList: function(uid) {
        return firebaseRef(['users', uid, 'admin', 'tempMaps', 'mapList']);
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
          },
          current: {
            fill: 'white',
            'stroke-opacity': 0.3
          },
          npc: {
            fill: 'yellow',
            'stroke-opacity': 0.3
          }
        }
      },

      initData: function(data) {
        var mapData = {
          nodes: {},
          newData: 0,
          rows: data.rows,
          cols: data.cols,
          width: data.cols * data.roomCols,
          height: data.rows * data.roomRows,
          connect: false,
          name: data.mapName,
          region: data.region
        };
        var deferred = $q.defer();
        var g, h, i, j,
          defaultRoom = {};

        for(g = 0; g < data.roomRows; g++) {
          defaultRoom[g] = {};
          for(h = 0; h < data.roomCols; h++) {
            defaultRoom[g][h] = 'a';
          }
        }

        for (i = 0; i < data.rows; i++) {
          mapData.nodes[i] = {};
          for (j = 0; j < data.cols; j++) {
            mapData.nodes[i][j] = {
              room: true,
              roomMap: defaultRoom,
              rows: data.roomRows,
              cols: data.roomCols,
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

      refreshView: function(nodeSize, data, optionalData) {
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
              direcs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
              length = direcs.length;
              mapCoord += mainRow + '-' + mainCol;
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
        if (optionalData) {
          optionalData.deferred.resolve(optionalData.mapBind);
        }
        this.refreshNodes(data);
      },

      oldNode: {},
      currentNode: function(row, col) {
        if (typeof this.oldNode.row !== 'undefined') {
          this.nodeGrid[this.oldNode.row][this.oldNode.col].attr(this.oldNode.attr);
        }
        this.oldNode = {
          row: row * 2 + 1,
          col: col * 2 + 1,
          attr: this.nodeGrid[row * 2 + 1][col * 2 + 1].attr()
        };
        this.nodeGrid[row * 2 + 1][col * 2 + 1].attr(this.viewStyling.nodeStyles.current);
      },

      npcChanges: {},
      showNpcNode: function(row, col) {
        if (typeof this.npcChanges[row] === 'undefined') {
          this.npcChanges[row] = {};
        }
        this.npcChanges[row][col] = this.nodeGrid[row * 2 + 1][col * 2 + 1].attr();
        this.nodeGrid[row * 2 + 1][col * 2 + 1].attr(this.viewStyling.nodeStyles.npc);
      },

      revertNpcNode: function(row, col) {
        this.nodeGrid[row * 2 + 1][col * 2 + 1].attr(this.npcChanges[row][col]);
        delete this.npcChanges[row][col];
        if (Object.keys(this.npcChanges[row]).length === 0) {
          delete this.npcChanges[row];
        }
      },

      revertNpcNodes: function() {
        var changes = this.npcChanges;
        var keys = Object.keys(changes);
        var length = keys.length, innerKeys, innerLength,
          grid = this.nodeGrid, i, j;
        for (i = 0; i < length; ++i) {
          innerKeys = Object.keys(changes[keys[i]]);
          innerLength = innerKeys.length;
          for (j = 0; j < innerLength; ++j) {
            grid[keys[i] * 2 + 1][innerKeys[j] * 2 + 1].attr(changes[keys[i]][innerKeys[j]]);
          }
        }
        this.npcChanges = {};
      },

      simpleRefresh: function(dataArray, walkable, mainNode) {
        var length = dataArray.length, i, coord, newState, rect, className, mainCoord, style,
          nodeGrid = this.nodeGrid;
        if (walkable) {
          style = this.viewStyling.nodeStyles.blocked;
          newState = 'F';
        } else {
          style = this.viewStyling.nodeStyles.normal;
          newState = 'T';
        }
        for (i = 0; i < length; i++) {
          coord = dataArray[i].split('-');
          mainCoord = [(coord[0] * 2 + 1), (coord[1] * 2 + 1)];
          if (mainNode === true) {
            rect = nodeGrid[mainCoord[0]][mainCoord[1]];
          } else {
            switch(coord[2]) {
              case 'n':
                rect = nodeGrid[mainCoord[0]-1][mainCoord[1]];
                break;
              case 's':
                rect = nodeGrid[mainCoord[0]+1][mainCoord[1]];
                break;
              case 'e':
                rect = nodeGrid[mainCoord[0]][mainCoord[1]+1];
                break;
              case 'w':
                rect = nodeGrid[mainCoord[0]][mainCoord[1]-1];
                break;
              case 'nw':
                rect = nodeGrid[mainCoord[0]-1][mainCoord[1]-1];
                break;
              case 'ne':
                rect = nodeGrid[mainCoord[0]-1][mainCoord[1]+1];
                break;
              case 'sw':
                rect = nodeGrid[mainCoord[0]+1][mainCoord[1]-1];
                break;
              case 'se':
                rect = nodeGrid[mainCoord[0]+1][mainCoord[1]+1];
                break;
            }
          }
          rect.attr(style);
          className = rect.node.getAttribute('class');
          className = className.substr(1);
          className = newState + className;
          rect.node.setAttribute('class', className);
        }
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

      },

      autoNodes: function(defaultState, data, opening) {
        var i, j, k, l, createRowTask, nodeRows, nodeCols, roomState, vertDiff, horDiff, horLeft, vertTop,
          numCols = data.cols,
          numRows = data.rows,
          direcs = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'],
          length = direcs.length;


        createRowTask = function(rowId) {
          for (j = 0; j < numCols; ++j) {
            nodeRows = data.nodes[rowId][j].rows;
            nodeCols = data.nodes[rowId][j].cols;

            if (!data.nodes[rowId][j].room) {
              roomState = 'a';
            } else {
              roomState = defaultState;
            }
            for (k = 0; k < nodeRows; ++k) {
              for (l = 0; l < nodeCols; ++l) {
                data.nodes[rowId][j].roomMap[k][l] = roomState;
              }
            }
            if (data.nodes[rowId][j].room) {
              vertDiff =  nodeRows - opening - 4;
              vertTop = vertDiff / 2 | 0;
              horDiff =  nodeCols - opening - 4;
              horLeft = horDiff / 2 | 0;
              for (k = 0; k < length; ++k) {
                switch(direcs[k]) {
                  case 'n':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      for (l = 2; l < nodeCols - 2; ++l) {
                        data.nodes[rowId][j].roomMap[0][l] = 'a';
                      }
                    } else if (numCols > 5 && (horDiff > 0)) {
                      if (horLeft > 0) {
                        for (l = 0; l < horLeft; ++l) {
                          data.nodes[rowId][j].roomMap[0][l + 2] = 'a';
                        }
                      }
                      for (l = 0; l < horDiff - horLeft; ++l) {
                        data.nodes[rowId][j].roomMap[0][nodeCols - 3 - l] = 'a';
                      }
                    }
                    break;
                  case 's':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      for (l = 2; l < nodeCols - 2; ++l) {
                        data.nodes[rowId][j].roomMap[nodeRows - 1][l] = 'a';
                      }
                    } else if (numCols > 5 && (horDiff > 0)) {
                      if (horLeft > 0) {
                        for (l = 0; l < horLeft; ++l) {
                          data.nodes[rowId][j].roomMap[nodeRows - 1][l + 2] = 'a';
                        }
                      }
                      for (l = 0; l < horDiff - horLeft; ++l) {
                        data.nodes[rowId][j].roomMap[nodeRows - 1][nodeCols - 3 - l] = 'a';
                      }
                    }
                    break;
                  case 'e':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      for (l = 2; l < nodeRows - 2; ++l) {
                        data.nodes[rowId][j].roomMap[l][nodeCols - 1] = 'a';
                      }
                    } else if (numCols > 5 && (vertDiff > 0)) {
                      if (vertTop> 0) {
                        for (l = 0; l < vertTop; ++l) {
                          data.nodes[rowId][j].roomMap[l + 2][nodeCols - 1] = 'a';
                        }
                      }
                      for (l = 0; l < vertDiff - vertTop; ++l) {
                        data.nodes[rowId][j].roomMap[nodeRows - 3 - l][nodeCols - 1] = 'a';
                      }
                    }
                    break;
                  case 'w':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      for (l = 2; l < nodeRows - 2; ++l) {
                        data.nodes[rowId][j].roomMap[l][0] = 'a';
                      }
                    } else if (numCols > 5 && (vertDiff > 0)) {
                      if (vertTop> 0) {
                        for (l = 0; l < vertTop; ++l) {
                          data.nodes[rowId][j].roomMap[l + 2][0] = 'a';
                        }
                      }
                      for (l = 0; l < vertDiff - vertTop; ++l) {
                        data.nodes[rowId][j].roomMap[nodeRows - 3 - l][0] = 'a';
                      }
                    }
                    break;
                  case 'nw':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      data.nodes[rowId][j].roomMap[0][0] = 'a';
                      data.nodes[rowId][j].roomMap[0][1] = 'a';
                      data.nodes[rowId][j].roomMap[1][0] = 'a';
                    }
                    break;
                  case 'ne':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      data.nodes[rowId][j].roomMap[0][nodeCols -2] = 'a';
                      data.nodes[rowId][j].roomMap[0][nodeCols -1] = 'a';
                      data.nodes[rowId][j].roomMap[1][nodeCols -1] = 'a';
                    }
                    break;
                  case 'sw':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      data.nodes[rowId][j].roomMap[nodeRows - 1][1] = 'a';
                      data.nodes[rowId][j].roomMap[nodeRows - 1][0] = 'a';
                      data.nodes[rowId][j].roomMap[nodeRows - 2][0] = 'a';
                    }
                    break;
                  case 'se':
                    if (data.nodes[rowId][j][direcs[k]] === 'b') {
                      data.nodes[rowId][j].roomMap[nodeRows - 1][nodeCols -2] = 'a';
                      data.nodes[rowId][j].roomMap[nodeRows - 1][nodeCols -1] = 'a';
                      data.nodes[rowId][j].roomMap[nodeRows - 2][nodeCols -1] = 'a';
                    }
                    break;
                }
              }
            }
          }
        };
        for (i = 0; i < numRows; ++i) {
          (createRowTask(i));
        }
      }
    };
  }]);
