(function () {
	var _ctx, _canvas, chase = {},
		_player, playerClass, _deaths = [], deathClass;

	playerClass = function (x, y) {
		this.x = x;
		this.y = y;
	};

	deathClass = function (x, y) {
		this.x = x;
		this.y = y;
	};

	function _drawBackground () {
		var img = new Image();

		img.src = 'resources/bg-grass.png';
		img.onload = function(){
			// create pattern
			var pattern = _ctx.createPattern(this, 'repeat'); // Create a pattern with this image, and set it to "repeat".
			_ctx.fillStyle = pattern;
			_ctx.fillRect(0, 0, _canvas.width, _canvas.height); // context.fillRect(x, y, width, height);
		}
	}

	function _draw (x, y, url) {
		var img = new Image();

		img.src = url;
		img.onload = function(){
			// the animations have 4 frames
			// the grid has cells of 48x48px
			// there are 4 directions, so 4 rows in the sprite
			// @TODO handle non animated images
			var width = img.width <= 48 && img.width || img.width / 4,
				height = img.height <= 48 && img.height || img.height / 4;

			_ctx.drawImage(
				this,
				// Start in the sprite board
				0, 0,
				// Dimensions in the sprite board
				width, height,
				// Position in the canvas
				48 * x + Math.ceil(48 - width) / 2, 48 * y + Math.ceil(48 - height) / 2,
				// Dimensions in the canvas
				width, height
			); // context.fillRect(x, y, width, height);
		}
	}

	function _createPlayer (x, y) {
		_player = new playerClass(x, y);
		_drawPlayer(x, y);
	}

	function _createDeath (x, y) {
		var death = new playerClass(x, y);
		_deaths.push(death);
		_drawDeath(x, y);
	}

	function _drawPlayer (x, y) {
		_draw(x, y, 'resources/player.png');
	}

	function _drawRock (x, y) {

	}

	function _drawTree (x, y) {
		_draw(x, y, 'resources/tree.png');
	}

	function _drawHome (x, y) {

	}

	function _drawDeath (x, y) {
		_draw(x, y, 'resources/death.png');
	}

	function _initLevel (levelIndex) {
		var row, col;

		for (col = 0; col < chase.levels[levelIndex].length; col++) {
			for (row = 0; row < chase.levels[levelIndex][col].length; row++) {
				switch (chase.levels[levelIndex][col][row]) {
					case 'P':
						_createPlayer(row, col);
						break;
					case 'T':
						_drawTree(row, col);
						break;
					case 'D':
						_createDeath(row, col);
						break;
				}
			}
		}
	}

	function _initEvents () {
		B.addEvent(document, 'keydown', function (e) {
			switch (e.which) {
				case 37: // left
					e.preventDefault();
					break;
				case 38: // up
					e.preventDefault();
					break;
				case 39: // right
					e.preventDefault();
					break;
				case 40: // down
					e.preventDefault();
					break;
			};
		}.bind(this));
	}

	function _startMainLoop () {
		var fps = 60,
			game;

		game = setInterval(function () {
			_updateScene();
		}, 1000 / fps);
	}

	function _updateScene () {

	}

	chase.start = function (canvas) {
		_ctx, _currentLevel = 0;

		_canvas =  B.$id(canvas);
		_ctx = _canvas.getContext('2d');

		_drawBackground();
		_initLevel(_currentLevel);

		_initEvents();

		_startMainLoop();
	};

	/**
	 * P = Player
	 * R = Rock
	 * T = Tree
	 * H = Home
	 * D = Death
	 */
	chase.levels = [
		[
			['','','','R','','P','','','',''],
			['','','','','','','','','',''],
			['','R','','T','','','','R','',''],
			['','','','','','','','','',''],
			['','D','','','','','','T','',''],
			['','','','','','','','','D',''],
			['','T','R','','T','','','','',''],
			['','','','','','','','','R',''],
			['','','','','','','T','','',''],
			['','','','','','','','','','H']
		]

	];

	window.chase = chase;
})();
