if (typeof (require) != 'undefined') {
	var sCape = require('./sCape.js').sCape;
}

sCape.addModule('Level', function () {
	var Level = function (grid) {
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

	Level.Grid = function (tileWidth, tileHeight, map) {
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

		this.getCell = function (point) {
			return {cellX: point.cellX, cellY: point.cellY, content: this.map[point.cellY][point.cellX]};
		};

		this.getNeighbours = function (point) {
			var n = [];

			if (point.cellY > 0) {
				n.push({cellX: point.cellX, cellY: point.cellY - 1, content: this.map[point.cellY - 1][point.cellX]});
			}
			if (point.cellX > 0) {
				n.push({cellX: point.cellX - 1, cellY: point.cellY, content: this.map[point.cellY][point.cellX - 1]});
			}
			if (point.cellY < this.map.length - 1) {
				n.push({cellX: point.cellX, cellY: point.cellY + 1, content: this.map[point.cellY + 1][point.cellX]});
			}
			if (point.cellX < this.map[0].length - 1) {
				n.push({cellX: point.cellX + 1, cellY: point.cellY, content: this.map[point.cellY][point.cellX + 1]});
			}

			return n;
		}
	};

	Level.Grid.getObjectDisplayXFromCell = function (cellX, gridWidth, resourceWidth) {
		var x = cellX * Level.currentLevel.grid.tileWidth + (Level.currentLevel.grid.tileWidth - resourceWidth) / 2;
		return Math.max(0, Math.min(gridWidth - resourceWidth, x));
	}

	Level.Grid.getObjectDisplayYFromCell = function (cellY, gridHeight, resourceHeight) {
		var y = cellY * Level.currentLevel.grid.tileHeight + Level.currentLevel.grid.tileHeight - resourceHeight;
		return Math.max(0, Math.min(gridHeight - resourceHeight, y));
	}

	Level.currentLevel = null;

	if (typeof (exports) != 'undefined') {
		exports.Level = Level;
	}

	return Level;
});

