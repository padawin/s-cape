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
			return cellY * _tileHeight + _tileHeight - resourceHeight;
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
	};

	sCape.Level = function (grid) {
		this.grid = grid;
	};

	sCape.Level.currentLevel = null;
})(sCape);

