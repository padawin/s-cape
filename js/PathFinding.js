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
		var current = end,
			path = [current];
		while (current != start) {
			current = cameFrom[_getKey(current)];
			path.push(current);
		}
		path.reverse();

		return path;
	}

	sCape.PathFinding = {
		shortestPath: function (grid, start, end) {
			var graph = new Graph(grid.map),
				start = graph.grid[start.cellY][start.cellX],
				end = graph.grid[end.cellY][end.cellX],
				result = astar.search(graph, start, end);

			return result;

			// @XXX @TODO Fix implementation
			//~var cameFrom = {},
				//~costSoFar = {},
				//~current,
				//~frontier,
				//~neighbours,
				//~next,
				//~nextKey,
				//~newCost;
//~
			//~frontier = new HeapQueue(function(a, b) {
				//~return a.priority - b.priority;
			//~});
			//~start.priority = 0;
//~
			//~frontier.push(start);
			//~cameFrom[_getKey(start)] = null;
			//~costSoFar[_getKey(start)] = 0;
//~
			//~while (frontier.length > 0) {
				//~current = frontier.pop();
//~
				//~if (current == end) {
					//~break;
				//~}
//~
				//~neighbours = grid.getNeighbours(current);
				//~newCost = costSoFar[_getKey(current)] + 1;
				//~for (next in neighbours) {
					//~if (neighbours[next].content == 'T') {
						//~continue;
					//~}
//~
					//~nextKey = _getKey(neighbours[next]);
					//~if (!(nextKey in costSoFar) || newCost < costSoFar[nextKey]) {
						//~costSoFar[nextKey] = newCost;
						//~next.priority = newCost + heuristic(end, neighbours[next]);
						//~frontier.push(neighbours[next]);
						//~cameFrom[nextKey] = current;
					//~}
				//~}
			//~}
//~
			//~return getPath(cameFrom, start, end);
		}
	};

})(sCape);

