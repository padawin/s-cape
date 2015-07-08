(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Level module";
	}

	sCape.Grid = function (tileWidth, tileHeight) {
		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;

		// The position of a resource according to its grid's cell is horizontally
		// centered and at the bottom of the cell
		this.getResourceAbsoluteXCoordinatesFromCell = function (cellX, resourceWidth) {
			return cellX * this.tileWidth + (this.tileWidth - resourceWidth) / 2;
		};

		this.getResourceAbsoluteYCoordinatesFromCell = function (cellY, resourceHeight) {
			return cellY * _tileHeight + _tileHeight - resourceHeight;
		};
	};

	sCape.Level = function (grid) {
		this.grid = grid;
	}

})(sCape);

