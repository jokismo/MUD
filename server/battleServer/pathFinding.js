'use strict';

var _ = require('underscore'),
randFromArray = require('../helpers').randFromArray;

function AStarSearch(grid, scale) {
  this.grid = new Grid(grid, scale);
}

AStarSearch.prototype.init = function() {
  var i, j, numRows, numCols;
  numRows = this.grid.length;
  for (i = 0; i < numRows; ++i) {
    numCols = this.grid[i].length;
    for (j = 0; j < numCols; ++j) {
      this.grid[i][j].neighbors = this.neighbors(this.grid[i][j]);
    }
  }
};

AStarSearch.prototype.heap = function() {
  return new PfBinaryHeap(function(node) {
    return node.f;
  });
};

AStarSearch.prototype.bresenham = function(x0, y0, x1, y1){   // 0, 0, 2, 3
  var dx = Math.abs(x1 - x0); // 2
  var dy = Math.abs(y1 - y0); // 3
  var sx = (x0 < x1) ? 1 : -1; // if right then 1
  var sy = (y0 < y1) ? 1 : -1; // if down then 1
  var err = dx - dy; // -1
  var returnArray = [];
  while (true) {
    returnArray.push([x0, y0]);
    if ((x0 === x1) && (y0 === y1)) {
      break;
    }
    var e2 = 2 * err; // -2
    if (e2 > -dy) { // true
      err -= dy; // err = -4
      x0  += sx; // 1
    }
    if (e2 < dx) {
      err += dx;
      y0  += sy;
    }
  }
  return returnArray;
};

AStarSearch.prototype.difference = function(from, to, zWeight) {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
    z: (to.z * zWeight) - (from.z * zWeight)
  };
};

AStarSearch.prototype.distance = function(from, to, zWeight) {
  var difference = this.difference(from, to, zWeight);
  return (Math.sqrt(difference.x * difference.x + difference.y * difference.y + difference.z * difference.z)) | 0;
};

AStarSearch.prototype.compDistance = function(from, to, zWeight) {
  var difference = this.difference(from, to, zWeight);
  return difference.x * difference.x + difference.y * difference.y + difference.z * difference.z;
};

AStarSearch.prototype.getDistance = function(from, to, zWeight) {
  from = this.grid[from[0]][from[1]];
  to = this.grid[to[0]][to[1]];
  var difference = this.difference(from, to, zWeight);
  return (Math.sqrt(difference.x * difference.x + difference.y * difference.y + difference.z * difference.z)) | 0;
};

AStarSearch.prototype.getCompDistance = function(from, to, zWeight) {
  from = this.grid[from[0]][from[1]];
  to = this.grid[to[0]][to[1]];
  var difference = this.difference(from, to, zWeight);
  return difference.x * difference.x + difference.y * difference.y + difference.z * difference.z;
};

AStarSearch.prototype.processInitPos = function(pos, skew) {
  var node = this.grid[pos[0]][pos[1]];
  if (!_.isUndefined(skew)) {
    node = skewPos(node, skew);
  }
  if (!node.canInit || node.occupied) {
    node = this.findValidInitPos(node);
  }
  if (!node) {
    return false;
  }
  node.occupied = true;
  return node.pos;
};

function skewPos(node, skew) {
  var i;
  for (i = 0; i < skew; ++i) {
    node = randFromArray(node.neighbors);
  }
  return node;
}

AStarSearch.prototype.findValidInitPos = function(node, count) {
  var neighbors, numNeighbors, i;
  if (_.isUndefined(count)) {
    count = 0;
  }
  neighbors = node.neighbors[0].concat(node.neighbors[1]);
  numNeighbors = neighbors.length;
  for (i = 0; i < numNeighbors; ++i) {
    count++;
    if (neighbors[i].canInit && !neighbors[i].occupied) {
      return neighbors[i];
    }
  }
  if (count > 500) {
    return false;
  }
  this.findValidInitPos(randFromArray(neighbors), count);
};

AStarSearch.prototype.search = function(startPos, endPos, options) {
  var start, end, zWeight, heuristic, closest, openHeap, closestNode, currentNode,
    neighbors, i, numNeighbors, gScore, beenVisited, diagonal;
  zWeight = 1;
  heuristic = this.distance;
  closest = false;
  diagonal = true;
  if (options) {
    if (!_.isUndefined(options.zWeight)) {
      zWeight = options.zWeight;
    }
    if (options.heuristic) {
      heuristic = this[options.heuristic];
    }
    if (!_.isUndefined(options.closest)) {
      closest = options.closest;
    }
    if (!_.isUndefined(options.diagonal)) {
      diagonal = options.diagonal;
    }
  }
  start = this.grid[startPos[0]][startPos[1]];
  end = this.grid[endPos[0]][endPos[1]];
  openHeap = this.heap();
  closestNode = start;
  start.h = heuristic.call(this, start, end, zWeight);
  openHeap.push(start);
  while(openHeap.size() > 0) {
    currentNode = openHeap.pop();
    if(currentNode === end) {
      return pathTo(currentNode);
    }
    currentNode.closed = true;
    if (!diagonal) {
      neighbors = currentNode.neighbors[0];
    } else {
      neighbors = currentNode.neighbors[0].concat(currentNode.neighbors[1]);
    }
    numNeighbors = neighbors.length;
    for(i = 0; i < numNeighbors; i++) {
      var neighbor = neighbors[i];
      if(neighbor.closed || neighbor.occupied) {
        continue;
      }
      gScore = currentNode.g + heuristic.call(this, currentNode, neighbor, zWeight);
      beenVisited = neighbor.visited;
      if(!beenVisited || gScore < neighbor.g) {
        neighbor.visited = true;
        neighbor.parent = currentNode;
        neighbor.h = heuristic.call(this, neighbor, end, zWeight);
        neighbor.g = gScore;
        neighbor.f = neighbor.g + neighbor.h;
        if (closest) {
          if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
            closestNode = neighbor;
          }
        }
        if (!beenVisited) {
          openHeap.push(neighbor);
        }
        else {
          openHeap.rescoreElement(neighbor);
        }
      }
    }
  }
  if (closest) {
    return pathTo(closestNode);
  }
  return [];
};

function pathTo(node){
  var curr = node;
  var path = [];
  while(curr.parent) {
    path.push(curr.pos);
    curr = curr.parent;
  }
  return path.reverse();
}

AStarSearch.prototype.neighbors = function(node) {
  var n, e, s, w;
  var grid = this.grid;
  var ret = [];
  var x = node.pos[0];
  var y = node.pos[1];
  ret[0] = [];
  w = !!(grid[x-1] && grid[x-1][y] && grid[x-1][y].z !== -1);
  if(w) {
    ret[0].push(grid[x-1][y]);
  }
  e = !!(grid[x+1] && grid[x+1][y] && grid[x+1][y].z !== -1);
  if(e) {
    ret[0].push(grid[x+1][y]);
  }
  s = !!(grid[x] && grid[x][y-1] && grid[x][y-1].z !== -1);
  if(s) {
    ret[0].push(grid[x][y-1]);
  }
  n = !!(grid[x] && grid[x][y+1] && grid[x][y+1].z !== -1);
  if(n) {
    ret[0].push(grid[x][y+1]);
  }
  ret[1] = [];
  if(grid[x-1] && grid[x-1][y-1] && grid[x-1][y-1].z !== -1  && (s || w)) {
    ret[1].push(grid[x-1][y-1]);
  }
  if(grid[x+1] && grid[x+1][y-1] && grid[x+1][y-1].z !== -1  && (s || e)) {
    ret[1].push(grid[x+1][y-1]);
  }
  if(grid[x-1] && grid[x-1][y+1] && grid[x-1][y+1].z !== -1  && (n || w)) {
    ret[1].push(grid[x-1][y+1]);
  }
  if(grid[x+1] && grid[x+1][y+1] && grid[x+1][y+1].z !== -1  && (n || e)) {
    ret[1].push(grid[x+1][y+1]);
  }
  return ret;
};

AStarSearch.prototype.manhattan = function(start, end) {
  var pos0 = start.pos;
  var pos1 = end.pos;
  var d1 = Math.abs (pos1[0] - pos0[0]);
  var d2 = Math.abs (pos1[1] - pos0[1]);
  return d1 + d2;
};

AStarSearch.prototype.diagonal = function(start, end) {
  var pos0 = start.pos;
  var pos1 = end.pos;
  var D = 1;
  var D2 = Math.sqrt(2);
  var d1 = Math.abs (pos1[0] - pos0[0]);
  var d2 = Math.abs (pos1[1] - pos0[1]);
  return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
};

function Grid(grid, scale) {
  var x, y, row;
  var nodes = [];
  for (x = 0; x < grid.length; x++) {
    nodes[x] = [];
    row = grid[x];
    for (y = 0; y < row.length; y++) {
      nodes[x][y] = new Vector(x, y, row[y], scale);
    }
  }
  return nodes;
}

function Vector(x, y, data, scale) {
  this.pos = [x, y];
  this.x = x * scale;
  this.y = y * scale;
  this.z = data[0];
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.visited = false;
  this.closed = false;
  this.parent = null;
  this.occupied = false;
  this.canInit = data[1];
}

function PfBinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

PfBinaryHeap.prototype = {
  push: function(element) {
    this.content.push(element);
    this.bubbleUp(this.content.length - 1);
  },
  pop: function() {
    var result = this.content[0];
    var end = this.content.pop();
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },
  size: function() {
    return this.content.length;
  },
  rescoreElement: function(node) {
    this.bubbleUp(this.content.indexOf(node));
  },
  bubbleUp: function(n) {
    var element = this.content[n];
    var score = this.scoreFunction(element);
    while (n > 0) {
      var parentN = ((n + 1) >> 1) - 1,
        parent = this.content[parentN];
      if (score < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        n = parentN;
      }
      else {
        break;
      }
    }
  },
  sinkDown: function(n) {
    var length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);
    while(true) {
      var child2N = (n + 1) << 1, child1N = child2N - 1;
      var swap = null;
      var child1Score;
      if (child1N < length) {
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        if (child1Score < elemScore){
          swap = child1N;
        }
      }
      if (child2N < length) {
        var child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      else {
        break;
      }
    }
  }
};

module.exports = AStarSearch;