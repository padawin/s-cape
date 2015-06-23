(function () {
	var _ctx, _canvas, chase = {},
		_player, movableClass, playerClass, _deaths = [], deathClass,
		_directions = {
			'up': {x: 0, y: -2},
			'right': {x: 2, y: 0},
			'down': {x: 0, y: 2},
			'left': {x: -2, y: 0}
		},
		_worldChanged = true,
		_levels;

	movableClass = function (x, y) {
		this.x = x;
		this.y = y;
		this.speedX = 0;
		this.speedY = 0;
		this.moving = false;
		this.direction = 'down';

		this.isMoving = function () {
			return this.moving;
		};

		this.startMotion = function (direction) {
			if (!_directions[direction]) {
				throw 'Unknown direction: ' + direction;
			}

			this.direction = direction;
			this.moving = true;
			this.speedX = _directions[direction].x;
			this.speedY = _directions[direction].y;
		};

		this.stopMotion = function () {
			this.moving = false;
			this.speedX = 0;
			this.speedY = 0;
		};
	};

	playerClass = function (x, y) {
		movableClass.call(this, x, y);
	};

	deathClass = function (x, y) {
		movableClass.call(this, x, y);
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
			var width = img.width <= 48 ? img.width : img.width / 4,
				height = img.height <= 48 ? img.height : img.height / 4,
				coordX = 48 * x + Math.ceil(48 - width) / 2,
				coordY = 48 * y + Math.ceil(48 - height) / 2;

			_ctx.drawImage(
				this,
				// Start in the sprite board
				0, 0,
				// Dimensions in the sprite board
				width, height,
				// Position in the canvas
				coordX, coordY,
				// Dimensions in the canvas
				width, height
			); // context.fillRect(x, y, width, height);
		}
	}

	function _createPlayer (x, y) {
		_player = new playerClass(x, y);
	}

	function _createDeath (x, y) {
		_deaths.push(new deathClass(x, y));
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

	function _drawLevel (levelIndex, init) {
		var row, col;

		for (col = 0; col < _levels[levelIndex].length; col++) {
			for (row = 0; row < _levels[levelIndex].length; row++) {
				switch (_levels[levelIndex][col][row]) {
					case 'P':
						if (init) {
							_createPlayer(row, col);
						}
						_drawPlayer(row, col);
						break;
					case 'T':
						_drawTree(row, col);
						break;
					case 'D':
						if (init) {
							_createDeath(row, col);
						}
						_drawDeath(row, col);
						break;
				}
			}
		}
	}

	function _initEvents () {
		B.addEvent(document, 'keydown', function (e) {
			switch (e.which) {
				case 37: // left
					_player.startMotion('left');
					e.preventDefault();
					break;
				case 38: // up
					_player.startMotion('up');
					e.preventDefault();
					break;
				case 39: // right
					_player.startMotion('right');
					e.preventDefault();
					break;
				case 40: // down
					_player.startMotion('down');
					e.preventDefault();
					break;
			};
		});

		B.addEvent(document, 'keyup', function (e) {
			if (_player.isMoving()) {
				_player.stopMotion();
			}
		});
	}

	function _startMainLoop () {
		var fps = 60,
			game;

		_updateScene(true);
		game = setInterval(function () {
			_updateScene(false);
		}, 1000 / fps);
	}

	function _updateScene (init) {
		if (!_worldChanged) {
			return;
		}

		_drawBackground();
		_drawLevel(_currentLevel, init);
		_worldChanged = false;
	}

	chase.start = function (canvas) {
		_ctx, _currentLevel = 0;

		_canvas =  B.$id(canvas);
		_ctx = _canvas.getContext('2d');

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
	_levels = [
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
