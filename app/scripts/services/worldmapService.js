'use strict';

angular.module('mudApp.mainView')

  .service('worldmapService', ['getBind', function(getBind) {

    return {

      getData: function(mapname) {
        var link = ['maps', mapname];
        return getBind(link);
      },

      initView: function(data) {
        this.mapData = data;
        this.generateGrid();
      },

      mapData : {},

      nodeGrid: [],

      mainNodeGrid: [],

      nodeSize: 3,

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

      generateGrid : function() {
      var i, j, l, rect, path, mainNode, oddRow, evenCol, createRowTask,
        nodeSize    = this.nodeSize,
        normalStyle = this.viewStyling.nodeStyles.normal,
        data        = this.mapData,
        paper       = this.paper,
        nodeGrid    = this.nodeGrid,
        mainNodeGrid = this.mainNodeGrid,
        numCols     = data.cols * 2 + 1,
        numRows     = data.rows * 2 + 1,
        posX = 0,
        posY = 0,
        k = 0,
        mainRowId = 0,
        pathString = ['M', 'L', 'L', 'L', 'Z'],
        slope = (10.5 / Math.sin(45)),
        offsetA = ((Math.sqrt((slope * slope) - (10.5 * 10.5))) / 3) * nodeSize,
        offsetB = (Math.sqrt((slope * 2 / 3) * (slope * 2 / 3) - 49)) * nodeSize;
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

          evenCol = j % 2 === 0;
          mainNode = oddRow && (j % 2 !== 0);

          if (mainNode) {
            rect.transform('s3');
            if (j === 1) {
              mainNodeGrid[mainRowId] = [];
            }
            mainNodeGrid[mainRowId].push(rect.node);
            if (j + 2 === numCols) {
              mainRowId++;
            }
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

      this.setStartPosition();
      },

      setStartPosition : function() {
        var startrow = this.mapData.start.testmap2.r;
        var startcol = this.mapData.start.testmap2.c;
        this.findMainNode(startrow, startcol);
      },

      findMainNode: function(row, col) {
        row = 1 + (2 * row);
        col = 1 + (2 * col);
        var node = this.nodeGrid[row][col];
        this.colorizeNode(node, 'white');
      },

      colorizeNode: function(node, color) {
        node.animate({
          fill: color
        }, this.viewStyling.nodeColorizeEffect.duration);
      },

                View: {

                  setStartPos: function(gridX, gridY) {
                    var coord = this.toPageCoordinate(gridX, gridY);
                    if (!this.startNode) {
                      this.startNode = this.paper.rect(
                          coord[0],
                          coord[1],
                          this.nodeSize,
                          this.nodeSize
                        ).attr(this.nodeStyle.normal)
                        .animate(this.nodeStyle.start, 1000);
                    } else {
                      this.startNode.attr({ x: coord[0], y: coord[1] }).toFront();
                    }
                  },
                  setEndPos: function(gridX, gridY) {
                    var coord = this.toPageCoordinate(gridX, gridY);
                    if (!this.endNode) {
                      this.endNode = this.paper.rect(
                          coord[0],
                          coord[1],
                          this.nodeSize,
                          this.nodeSize
                        ).attr(this.nodeStyle.normal)
                        .animate(this.nodeStyle.end, 1000);
                    } else {
                      this.endNode.attr({ x: coord[0], y: coord[1] }).toFront();
                    }
                  },
                  /**
                   * Set the attribute of the node at the given coordinate.
                   */
                  setAttributeAt: function(gridX, gridY, attr, value) {
                    var color, nodeStyle = this.nodeStyle;
                    switch (attr) {
                      case 'walkable':
                        color = value ? nodeStyle.normal.fill : nodeStyle.blocked.fill;
                        this.setWalkableAt(gridX, gridY, value);
                        break;
                      case 'opened':
                        this.colorizeNode(this.rects[gridY][gridX], nodeStyle.opened.fill);
                        this.setCoordDirty(gridX, gridY, true);
                        break;
                      case 'closed':
                        this.colorizeNode(this.rects[gridY][gridX], nodeStyle.closed.fill);
                        this.setCoordDirty(gridX, gridY, true);
                        break;
                      case 'tested':
                        color = (value === true) ? nodeStyle.tested.fill : nodeStyle.normal.fill;

                        this.colorizeNode(this.rects[gridY][gridX], color);
                        this.setCoordDirty(gridX, gridY, true);
                        break;
                      case 'parent':
                        // XXX: Maybe draw a line from this node to its parent?
                        // This would be expensive.
                        break;
                      default:
                        console.error('unsupported operation: ' + attr + ':' + value);
                        return;
                    }
                  },
                  colorizeNode: function(node, color) {
                    node.animate({
                      fill: color
                    }, this.nodeColorizeEffect.duration);
                  },
                  zoomNode: function(node) {
                    node.toFront().attr({
                      transform: this.nodeZoomEffect.transform,
                    }).animate({
                        transform: this.nodeZoomEffect.transformBack,
                      }, this.nodeZoomEffect.duration);
                  },
                  setWalkableAt: function(gridX, gridY, value) {
                    var node, i, blockedNodes = this.blockedNodes;
                    if (!blockedNodes) {
                      blockedNodes = this.blockedNodes = new Array(this.numRows);
                      for (i = 0; i < this.numCols; ++i) {
                        blockedNodes[i] = [];
                      }
                    }
                    node = blockedNodes[gridY][gridX];
                    if (value) {
                      // clear blocked node
                      if (node) {
                        this.colorizeNode(node, this.rects[gridY][gridX].attr('fill'));
                        this.zoomNode(node);
                        setTimeout(function() {
                          node.remove();
                        }, this.nodeZoomEffect.duration);
                        blockedNodes[gridY][gridX] = null;
                      }
                    } else {
                      // draw blocked node
                      if (node) {
                        return;
                      }
                      node = blockedNodes[gridY][gridX] = this.rects[gridY][gridX].clone();
                      this.colorizeNode(node, this.nodeStyle.blocked.fill);
                      this.zoomNode(node);
                    }
                  },
                  clearFootprints: function() {
                    var i, x, y, coord, coords = this.getDirtyCoords();
                    for (i = 0; i < coords.length; ++i) {
                      coord = coords[i];
                      x = coord[0];
                      y = coord[1];
                      this.rects[y][x].attr(this.nodeStyle.normal);
                      this.setCoordDirty(x, y, false);
                    }
                  },
                  clearBlockedNodes: function() {
                    var i, j, blockedNodes = this.blockedNodes;
                    if (!blockedNodes) {
                      return;
                    }
                    for (i = 0; i < this.numRows; ++i) {
                      for (j = 0 ;j < this.numCols; ++j) {
                        if (blockedNodes[i][j]) {
                          blockedNodes[i][j].remove();
                          blockedNodes[i][j] = null;
                        }
                      }
                    }
                  },
                  drawPath: function(path) {
                    if (!path.length) {
                      return;
                    }
                    var svgPath = this.buildSvgPath(path);
                    this.path = this.paper.path(svgPath).attr(this.pathStyle);
                  },
                  /**
                   * Given a path, build its SVG represention.
                   */
                  buildSvgPath: function(path) {
                    var i, strs = [], size = this.nodeSize;

                    strs.push('M' + (path[0][0] * size + size / 2) + ' ' +
                      (path[0][1] * size + size / 2));
                    for (i = 1; i < path.length; ++i) {
                      strs.push('L' + (path[i][0] * size + size / 2) + ' ' +
                        (path[i][1] * size + size / 2));
                    }

                    return strs.join('');
                  },
                  clearPath: function() {
                    if (this.path) {
                      this.path.remove();
                    }
                  },
                  /**
                   * Helper function to convert the page coordinate to grid coordinate
                   */
                  toGridCoordinate: function(pageX, pageY) {
                    return [
                      Math.floor(pageX / this.nodeSize),
                      Math.floor(pageY / this.nodeSize)
                    ];
                  },
                  /**
                   * helper function to convert the grid coordinate to page coordinate
                   */
                  toPageCoordinate: function(gridX, gridY) {
                    return [
                      gridX * this.nodeSize,
                      gridY * this.nodeSize
                    ];
                  },
                  showStats: function(opts) {
                    var texts = [
                      'length: ' + Math.round(opts.pathLength * 100) / 100,
                      'time: ' + opts.timeSpent + 'ms',
                      'operations: ' + opts.operationCount
                    ];
                    $('#stats').show().html(texts.join('<br>'));
                  },
                  setCoordDirty: function(gridX, gridY, isDirty) {
                    var x, y,
                      numRows = this.numRows,
                      numCols = this.numCols,
                      coordDirty;

                    if (this.coordDirty === undefined) {
                      coordDirty = this.coordDirty = [];
                      for (y = 0; y < numRows; ++y) {
                        coordDirty.push([]);
                        for (x = 0; x < numCols; ++x) {
                          coordDirty[y].push(false);
                        }
                      }
                    }

                    this.coordDirty[gridY][gridX] = isDirty;
                  },
                  getDirtyCoords: function() {
                    var x, y,
                      numRows = this.numRows,
                      numCols = this.numCols,
                      coordDirty = this.coordDirty,
                      coords = [];

                    if (coordDirty === undefined) {
                      return [];
                    }

                    for (y = 0; y < numRows; ++y) {
                      for (x = 0; x < numCols; ++x) {
                        if (coordDirty[y][x]) {
                          coords.push([x, y]);
                        }
                      }
                    }
                    return coords;
                  }
                }

    };
  }]);
