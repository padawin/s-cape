(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Level module";
	}

	sCape.Grid = function (tileWidth, tileHeight, map) {
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
		this.map = map;

		// The position of a resource according to its grid's cell is horizontally
		// centered and at the bottom of the cell
		this.getResourceAbsoluteXCoordinatesFromCell = function (cellX, resourceWidth) {
			return cellX * this.tileWidth + (this.tileWidth - resourceWidth) / 2;
		};

		this.getResourceAbsoluteYCoordinatesFromCell = function (cellY, resourceHeight) {
			return cellY * tileHeight + tileHeight - resourceHeight;
		};

		this.loopThroughMap = function (callbacks) {
			var row, col, d = 0, currCell;

			for (col = 0; col < this.map.length; col++) {
				for (row = 0; row < this.map[col].length; row++) {
					currCell = this.map[col][row];
					if (currCell != '' && callbacks[currCell]) {
						callbacks[currCell](col, row);
					}
				}
			}
		};

		this.getNeighbours = function (point) {
			var n = [];

			if (point.cellY > 0 && this.map[point.cellY - 1][point.cellX] == '') {
				n.push({cellX: point.cellY - 1, cellY: point.cellX});
			}
			if (point.cellX > 0 && this.map[point.cellY][point.cellX - 1] == '') {
				n.push({cellX: point.cellY, cellY: point.cellX - 1});
			}
			if (point.cellY < this.map.length - 1 && this.map[point.cellY + 1][point.cellX] == '') {
				n.push({cellX: point.cellY + 1, cellY: point.cellX});
			}
			if (point.cellX < this.map[0].length - 1 && this.map[point.cellY][point.cellX + 1] == '') {
				n.push({cellX: point.cellY, cellY: point.cellX + 1});
			}

			return n;
		}
	};

	sCape.Grid.getObjectDisplayXFromCell = function (cellX, resourceWidth) {
		return cellX * sCape.Level.currentLevel.grid.tileWidth + (sCape.Level.currentLevel.grid.tileWidth - resourceWidth) / 2;
	}

	sCape.Grid.getObjectDisplayYFromCell = function (cellY, resourceHeight) {
		return cellY * sCape.Level.currentLevel.grid.tileHeight + sCape.Level.currentLevel.grid.tileHeight - resourceHeight;
	}

	sCape.Level = function (grid) {
		this.grid = grid;
		this.player = null;
		this.obstacles = [];
		this.deaths = [];

		this.createObstacle = function (type, obstacle) {
			this.obstacles.push({
				'type': type,
				'obstacle': obstacle
			});
		};
	};

	sCape.Level.currentLevel = null;
})(sCape);

