(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the PathFinding module";
	}

	function _getKey(object, a) {
		return object.cellX + '-' + object.cellY;
	}

	function heuristic(a, b) {
		// Manhattan distance on a square grid
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	function getPath(cameFrom, start, end) {
		var current = end;
		var path = [current];
		while (current != start) {
			current = cameFrom[_getKey(current)];
			path.push(current);
		}
		path.reverse();
		return path;
	}

	sCape.PathFinding = {
		shortestPath: function (grid, start, end) {
			var frontier = new HeapQueue(function(a, b) {
				return a.priority - b.priority;
			});
			start.priority = 0;

			frontier.push(start);
			var cameFrom = {};
			var costSoFar = {};
			cameFrom[_getKey(start)] = null;
			costSoFar[_getKey(start)] = 0;
			var current;

			while (frontier.length > 0) {
				current = frontier.pop();

				if (current == end) {
					break;
				}

				var neighbours = grid.getNeighbours(current);
				for (var next in neighbours) {
					var nextKey = _getKey(neighbours[next]);
					// 1 should be grid.cost(current, next)
					var newCost = costSoFar[_getKey(current)] + 1;
					if (!(nextKey in costSoFar) || newCost < costSoFar[nextKey]) {
						costSoFar[nextKey] = newCost;
						next.priority = newCost + heuristic(end, neighbours[next])
						frontier.push(neighbours[next]);
						cameFrom[nextKey] = current;
					}
				}
			}

			return getPath(cameFrom, start, end);
		}
	};

})(sCape);

