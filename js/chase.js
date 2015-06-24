(function () {
	var _ctx, _canvas, chase = {},
		_player, movableClass, playerClass, _deaths = [], deathClass,
		_directionsSetup = {
			'down': {x: 0, y: 2, spriteRow: 0},
			'left': {x: -2, y: 0, spriteRow: 1},
			'right': {x: 2, y: 0, spriteRow: 2},
			'up': {x: 0, y: -2, spriteRow: 3}
		},
		_directions = ['down', 'left', 'right', 'up'],
		_worldChanged = true,
		_levels,
		_resources = {
			// url, tile dimensions, top left position in grid's cell to be
			// middle bottom aligned
			'grass': {'url': 'resources/bg-grass.png', 'w': 40, 'h': 40},
			'tree': {'url': 'resources/tree.png', 'w': 48, 'h': 48, 'x': 0, 'y': 0},
			'player': {'url': 'resources/player.png', 'w': 32, 'h': 48, 'x': 8, 'y': 0},
			'death': {'url': 'resources/death.png', 'w': 50, 'h': 48, 'x': -1, 'y': 0}
		},
		_nbResources = 4,
		_tileWidth = 48,
		_tileHeight = 24;

	_directionsSetup[_directions[0]] = {x: 0, y: 2, spriteRow: 0};
	_directionsSetup[_directions[1]] = {x: -2, y: 0, spriteRow: 1};
	_directionsSetup[_directions[2]] = {x: 2, y: 0, spriteRow: 2};
	_directionsSetup[_directions[3]] = {x: 0, y: -2, spriteRow: 3};

	movableClass = function (x, y, direction) {
		this.x = x;
		this.y = y;
		this.speedX = 0;
		this.speedY = 0;
		this.moving = false;
		this.moveFrame = 0;
		this.direction = direction || 'down';

		this.isMoving = function () {
			return this.moving;
		};

		this.startMotion = function (direction) {
			if (this.isMoving()) {
				return;
			}

			if (!_directionsSetup[direction]) {
				throw 'Unknown direction: ' + direction;
			}

			if (this.willCollide(direction)) {
				return;
			}

			this.direction = direction;
			this.moving = true;
			this.speedX = _directionsSetup[direction].x;
			this.speedY = _directionsSetup[direction].y;
		};

		this.stopMotion = function () {
			this.moving = false;
			this.speedX = 0;
			this.speedY = 0;
			this.moveFrame = 0;
		};

		this.willCollide = function (direction) {
			if (direction == 'right'
					&& this.x / _tileWidth == _levels[_currentLevel].map[0].length - 1
				|| direction == 'down'
					&& this.y /  _tileHeight == _levels[_currentLevel].map.length - 1
				|| direction == 'left'
					&& this.x == 0
				|| direction == 'up'
					&& this.y == 0
			) {
				return true;
			}
			else if (
				direction == 'right'
					&& _levels[_currentLevel].map[this.y / _tileHeight][this.x / _tileWidth + 1] != ''
				|| direction == 'down'
					&& _levels[_currentLevel].map[this.y / _tileHeight + 1][this.x / _tileWidth] != ''
				|| direction == 'left'
					&& _levels[_currentLevel].map[this.y / _tileHeight][this.x / _tileWidth - 1] != ''
				|| direction == 'up'
					&& _levels[_currentLevel].map[this.y / _tileHeight - 1][this.x / _tileWidth] != ''
			) {
				return true;
			}
			else {
				return false;
			}
		}
	};

	playerClass = function (x, y, direction) {
		movableClass.call(this, x, y, direction);
	};

	deathClass = function (x, y, direction) {
		movableClass.call(this, x, y, direction);
	};

	function _drawBackground () {
		var img = _resources.grass.resource;
		// create pattern
		var pattern = _ctx.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
		_ctx.fillStyle = pattern;
		_ctx.fillRect(0, 0, _canvas.width, _canvas.height); // context.fillRect(x, y, width, height);
	}

	function _draw (x, y, resource, direction, moveFrame) {
		var resource = _resources[resource];
		// the animations have 4 frames
		// the grid has cells of _tileWidth * _tileHeight px
		// there are 4 directions, so 4 rows in the sprite
		// To set the sprite on the middle bottom of the tile
		var coordX = x + resource.x,
			coordY = y + resource.y,
			spriteStartX = moveFrame ? parseInt(moveFrame) * resource.w : 0,
			spriteStartY = direction ? _directionsSetup[direction].spriteRow * resource.h : 0;
		_ctx.drawImage(
			resource.resource,
			// Start in the sprite board
			spriteStartX, spriteStartY,
			// Dimensions in the sprite board
			resource.w, resource.h,
			// Position in the canvas
			coordX, coordY,
			// Dimensions in the canvas
			resource.w, resource.h
		); // context.fillRect(x, y, width, height);
	}

	function _createPlayer (x, y) {
		_player = new playerClass(x, y);
	}

	function _createDeath (x, y) {
		_deaths.push(
			new deathClass(x, y, _directions[parseInt(Math.random() * 100) % 4])
		);
	}

	function _drawPlayer () {
		var x, y;
		if (_player.x == null && _player.y == null) {
			// generate coordinates
			x = _tileWidth * _levels[_currentLevel].player[0];
			y = _tileHeight * _levels[_currentLevel].player[1];
		}
		else {
			x = _player.x;
			y = _player.y;
		}

		var coords = _draw(
			x, y, 'player', _player.direction, _player.moveFrame
		);
	}

	function _drawRock (x, y) {

	}

	function _drawTree (x, y) {
		_draw(_tileWidth * x, _tileHeight * y, 'tree');
	}

	function _drawHome (x, y) {

	}

	function _drawDeath (death, index) {
		var x, y;
		if (death.x == null && death.y == null) {
			// generate coordinates
			x = _tileWidth * _levels[_currentLevel].deaths[index][0];
			y = _tileHeight * _levels[_currentLevel].deaths[index][1];
		}
		else {
			x = death.x;
			y = death.y;
		}

		var coords = _draw(x, y, 'death', death.direction, death.moveFrame);
	}

	function _drawLevel (levelIndex) {
		var row, col, d;

		for (col = 0; col < _levels[levelIndex].map.length; col++) {
			for (row = 0; row < _levels[levelIndex].map[col].length; row++) {
				switch (_levels[levelIndex].map[col][row]) {
					case 'P':
						break;
					case 'T':
						_drawTree(row, col);
						break;
						break;
				}
			}
		}

		_drawPlayer();

		for (d = 0; d < _deaths.length; d++) {
			_drawDeath(_deaths[d], d);
		}
	}

	function _initLevel (levelIndex) {
		var d;

		_createPlayer(
			_tileWidth * _levels[levelIndex].player[0],
			_tileHeight * _levels[levelIndex].player[1]
		);

		for (d = 0; d < _levels[levelIndex].deaths.length; d++) {
			_createDeath(
				_tileWidth * _levels[levelIndex].deaths[d][0],
				_tileHeight * _levels[levelIndex].deaths[d][1]
			);
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
	}

	function _loadResources (loadedCallback) {
		var r, loaded = 0, loadingWidth = 0.70 * _canvas.width;

		// rect starts from 15% from the border of the canvas
		_ctx.rect(
			0.15 * _canvas.width, _canvas.height / 2 - 10,
			loadingWidth, 20
		);
		_ctx.stroke();

		for (r in _resources) {
			if (_resources.hasOwnProperty(r)) {
				_resources[r].resource = new Image();
				_resources[r].resource.src = _resources[r].url;
				_resources[r].resource.onload = function () {
					if (++loaded == _nbResources) {
						loadedCallback();
					}
					else {
						_ctx.fillRect(
							0.15 * _canvas.width, _canvas.height / 2 - 10,
							loadingWidth * loaded / _nbResources, 20
						);
					}
				};
			}
		}
	}

	function _startMainLoop () {

		var fps = 60,
			now,
			then = Date.now(),
			interval = 1000 / fps,
			delta;

		// found at http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
		function draw() {
			requestAnimationFrame(draw);

			now = Date.now();
			delta = now - then;

			if (delta > interval) {
				then = now - (delta % interval);

				_updateState();
				_updateScene();
			}
		}

		draw();
	}

	/**
	 * Update the position of the movable entities
	 */
	function _updateState () {
		var d;

		if (_player.isMoving()) {
			_player.x += _player.speedX;
			_player.y += _player.speedY;
			_worldChanged = true;
			_player.moveFrame = (_player.moveFrame + 0.25) % 4;

			if (_player.speedX && _player.x % _tileWidth == 0
				|| _player.speedY && _player.y % _tileHeight == 0
			) {
				_player.stopMotion();
			}
		}

		for (d = 0; d < _deaths.length; d++) {
			if (_deaths[d].isMoving()) {
				_deaths[d].x += _deaths[d].speedX;
				_deaths[d].y += _deaths[d].speedY;
				_worldChanged = true;
				_deaths[d].moveFrame = (_deaths[d].moveFrame + 0.25) % 4;
			}
		}
	}

	/**
	 * Redraw the scene if any entity moved
	 */
	function _updateScene () {
		if (!_worldChanged) {
			return;
		}

		_drawBackground();
		_drawLevel(_currentLevel);
		_worldChanged = false;
	}

	chase.start = function (canvas) {
		_ctx, _currentLevel = 0;

		_canvas = B.$id(canvas);
		_ctx = _canvas.getContext('2d');

		_initLevel(_currentLevel);
		_loadResources(function () {
			_initEvents();

			_startMainLoop();
		});
	};

	/**
	 * P = Player
	 * R = Rock
	 * T = Tree
	 * H = Home
	 * D = Death
	 */
	_levels = [
		{
			'player': [5, 0],
			'deaths': [[1, 4], [8, 5], [2, 9], [8, 13]],
			'map': [
				['','','','','','','','','',''],
				['','','','','','','','','',''],
				['','','','T','','','','','',''],
				['','','','','','','','','',''],
				['','','','','','','','T','',''],
				['','','','','','','','','',''],
				['','T','','','T','','','','',''],
				['','','','','','','','','',''],
				['','','','','','','T','','',''],
				['','','','','','','','','',''],
				['','','','','','','','','',''],
				['','','','','','','','','',''],
				['','','','T','','','','','',''],
				['','','','','','','','','',''],
				['','','','','','','','T','',''],
				['','','','','','','','','',''],
				['','T','','','T','','','','',''],
				['','','','','','','','','',''],
				['','','','','','','T','','',''],
				['','','','','','','','','','H']
			]
		}
	];

	window.chase = chase;
})();
