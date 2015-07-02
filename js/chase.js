(function () {
	var _ctx, _canvas, chase = {},
		_player, movableClass, playerClass, _deaths = [], deathClass,
		_directionsSetup = {},
		_directions = ['down', 'left', 'right', 'up'],
		_worldChanged = true,
		_levels,
		_currentLevelIndex,
		_resources = {
			// url, tile dimensions, top left position in grid's cell to be
			// middle bottom aligned
			'grass': {'url': 'resources/bg-grass.png', 'w': 40, 'h': 40},
			'tree': {'url': 'resources/tree.png', 'w': 48, 'h': 48, 'hitbox': [12, 36, 24, 12]},
			'player': {'url': 'resources/player.png', 'w': 32, 'h': 48, 'cellChange': [16, 36], 'hitbox': [8, 24, 16, 24]},
			'death': {'url': 'resources/death.png', 'w': 50, 'h': 48, 'cellChange': [25, 36], 'hitbox': [12, 24, 24, 24]}
		},
		_nbResources = 4,
		_tileWidth = 48,
		_tileHeight = 24,
		_obstacles = [],
		_isMobile;

	_directionsSetup[_directions[0]] = {
		x: 0, y: 2, spriteRow: 0, vAngleStart: Math.PI / 4, vAngleEnd: 3 * Math.PI / 4
	};
	_directionsSetup[_directions[1]] = {
		x: -2, y: 0, spriteRow: 1, vAngleStart: 3 * Math.PI / 4, vAngleEnd: 5 * Math.PI / 4
	};
	_directionsSetup[_directions[2]] = {
		x: 2, y: 0, spriteRow: 2, vAngleStart: 7 * Math.PI / 4, vAngleEnd: Math.PI / 4
	};
	_directionsSetup[_directions[3]] = {
		x: 0, y: -2, spriteRow: 3, vAngleStart: 5 * Math.PI / 4, vAngleEnd: 7 * Math.PI / 4
	};

	movableClass = function (cellX, cellY, resource, direction) {
		this.cellX = cellX;
		this.cellY = cellY;
		this.x = _getObjectDisplayXFromCell(cellX, resource.w);
		this.y = _getObjectDisplayYFromCell(cellY, resource.h);
		this.w = resource.w;
		this.h = resource.h;
		this.cellChange = resource.cellChange;
		this.hitbox = resource.hitbox;
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

		this.isColliding = function () {
			// Map borders
			if (this.x < 0
				|| this.y < 0
				|| this.x + this.w == _canvas.width
				|| this.y + this.h == _canvas.height
			) {
				return true;
			}
			// Object in map
			else {
				var o, nbObstacles = _obstacles.length;
				for (o = 0; o < nbObstacles; ++o) {
					if (this.x + this.hitbox[0] < (_obstacles[o].x + _obstacles[o].hitbox[0]) + _obstacles[o].hitbox[2]
						&& this.x + this.hitbox[0] + this.hitbox[2] > _obstacles[o].x + _obstacles[o].hitbox[0]
						&& this.y + this.hitbox[1] < (_obstacles[o].y + _obstacles[o].hitbox[1]) + _obstacles[o].hitbox[3]
						&& this.y + this.hitbox[1] + this.hitbox[3] > _obstacles[o].y + _obstacles[o].hitbox[1]
					) {
						return true;
					}
				}
			}

			return false;
		};
	};

	playerClass = function (x, y, direction) {
		movableClass.call(this, x, y, _resources['player'], direction);
	};

	deathClass = function (x, y, direction) {
		movableClass.call(this, x, y, _resources['death'], direction);
		this.rotationFrequency = parseInt(Math.random() * (1000 - 100 + 1)) + 100;
		this.frameBeforeRotation = 1;
		this.seesPlayer = false;

		this.visionDepth = 100;

		this.increaseRotationFrequency = function () {
			this.frameBeforeRotation = (this.frameBeforeRotation + 1) % this.rotationFrequency;
			if (this.frameBeforeRotation == 0) {
				this.direction = _directions[parseInt(Math.random() * 100) % 4];
				return true;
			}

			return false;
		};

		this.detectPlayer = function (detects) {
			if (detects) {
				this.seesPlayer = true;
			}
			else {
				this.seesPlayer = false;
			}
		}
	};

	function _getObjectDisplayXFromCell (cellX, resourceWidth) {
		return cellX * _tileWidth + (_tileWidth - resourceWidth) / 2;
	}

	function _getObjectDisplayYFromCell (cellY, resourceHeight) {
		return cellY * _tileHeight + _tileHeight - resourceHeight;
	}

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
		var coordX = x,
			coordY = y,
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
		);
	}

	function _createPlayer (x, y) {
		_player = new playerClass(x, y);
	}

	function _createDeath (x, y) {
		_deaths.push(
			new deathClass(x, y, _directions[parseInt(Math.random() * 100) % 4])
		);
	}

	function _createObstacle (type, cellX, cellY) {
		_obstacles.push({
			'x': _getObjectDisplayXFromCell(cellX, _resources[type].w),
			'y': _getObjectDisplayYFromCell(cellY, _resources[type].h),
			'hitbox': _resources[type].hitbox
		});
	}

	function _drawPlayer () {
		_draw(
			_player.x, _player.y,
			'player', _player.direction, _player.moveFrame
		);
	}

	function _drawRock (x, y) {

	}

	function _drawTree (cellX, cellY) {
		_draw(
			_getObjectDisplayXFromCell(cellX, _resources['tree'].w),
			_getObjectDisplayYFromCell(cellY, _resources['tree'].h),
			'tree'
		);
	}

	function _drawHome (x, y) {

	}

	function _drawDeath (death) {
		if (death.seesPlayer) {
			_ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
		}
		else {
			_ctx.fillStyle = 'rgba(0, 150, 0, 0.5)';
		}
		_ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		_ctx.beginPath();
		_ctx.moveTo(
			death.x + death.cellChange[0],
			death.y + death.cellChange[1]
		);
		_ctx.arc(
			death.x + death.cellChange[0],
			death.y + death.cellChange[1],
			death.visionDepth,
			_directionsSetup[death.direction].vAngleStart,
			_directionsSetup[death.direction].vAngleEnd
		);
		_ctx.lineTo(
			death.x + death.cellChange[0],
			death.y + death.cellChange[1]
		);
		_ctx.fill();
		_ctx.stroke();
		_ctx.closePath();

		_draw(
			death.x, death.y, 'death',
			death.direction, death.moveFrame
		);
	}

	function _loopThroughMap (callbacks) {
		var row, col, d = 0, currCell;

		for (col = 0; col < _levels[_currentLevelIndex].map.length; col++) {
			for (row = 0; row < _levels[_currentLevelIndex].map[col].length; row++) {
				currCell = _levels[_currentLevelIndex].map[col][row];
				if (currCell != '' && callbacks[currCell]) {
					callbacks[currCell](col, row);
				}
			}
		}
	}

	function _drawLevel () {
		var d = 0;

		_loopThroughMap({
			'P': function (col, row) {
				_drawPlayer();
			},
			'T': function (col, row) {
				_drawTree(row, col);
			},
			'D': function (col, row) {
				_drawDeath(_deaths[d]);
				++d;
			}
		});
	}

	function _initLevel () {
		_canvas.width = _levels[_currentLevelIndex].map[0].length * _tileWidth;
		_canvas.height = _levels[_currentLevelIndex].map.length * _tileHeight;

		_loopThroughMap({
			'P': function (col, row) {
				_createPlayer(row, col);
			},
			'T': function (col, row) {
				_createObstacle('tree', row, col);
			},
			'D': function (col, row) {
				_createObstacle('death', row, col);
				_createDeath(row, col);
			}
		});
	}

	function _initEvents () {
		if (_isMobile) {
			function _touchEvent (e) {
				var trigoX, trigoY, touchRatio, canvasRatio;
				trigoX = e.touches[0].clientX - _canvas.width / 2;
				trigoY = -1 * e.touches[0].clientY + _canvas.height / 2;
				touchRatio = Math.abs(trigoY / trigoX);
				canvasRatio = _canvas.height / _canvas.width;
				if (trigoY > 0 && touchRatio > canvasRatio) {
					_player.startMotion('up');
				}
				else if (trigoY < 0 && touchRatio > canvasRatio) {
					_player.startMotion('down');
				}
				else if (trigoX > 0) {
					_player.startMotion('right');
				}
				else {
					_player.startMotion('left');
				}
			}

			B.addEvent(_canvas, 'touchstart', _touchEvent);

			B.addEvent(_canvas, 'touchmove', _touchEvent);

			B.addEvent(_canvas, 'touchend', function (e) {
				_player.stopMotion();
			});
		}
		else {
			B.addEvent(document, 'keyup', function (e) {
				if (_player.isMoving()) {
					_worldChanged = true;
					_player.stopMotion();
				}
			});

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
	 * May contain factorizable calculations
	 */
	function _updateState () {
		var d, oldX = _player.x, oldY = _player.y, newPX, newPY,
			changed;

		if (_player.isMoving()) {
			_player.x += _player.speedX;
			_player.y += _player.speedY;
			_worldChanged = true;

			if (_player.isColliding()) {
				_player.x = oldX;
				_player.y = oldY;
				_player.stopMotion();
			}
			else {
				_player.moveFrame = (_player.moveFrame + 0.25) % 4;

				newPX = parseInt((_player.x + _player.cellChange[0]) / _tileWidth);
				newPY = parseInt((_player.y + _player.cellChange[1]) / _tileHeight);
				if (_levels[_currentLevelIndex].map[newPY][newPX] == '') {
					_levels[_currentLevelIndex].map[_player.cellY][_player.cellX] = '';
					_player.cellX = newPX;
					_player.cellY = newPY;
					_levels[_currentLevelIndex].map[_player.cellY][_player.cellX] = 'P';
				}
			}
		}

		for (d = 0; d < _deaths.length; d++) {
			if (_deaths[d].isMoving()) {
				_deaths[d].x += _deaths[d].speedX;
				_deaths[d].y += _deaths[d].speedY;
				_worldChanged = true;
				_deaths[d].moveFrame = (_deaths[d].moveFrame + 0.25) % 4;
			}
			else {
				changed = _deaths[d].increaseRotationFrequency();
				if (changed) {
					_worldChanged = true;
				}
			}


			if (_worldChanged && d == 0) {
				// Try to detect player
				var dist = Math.sqrt(
					Math.pow(_player.x + _player.cellChange[0] - (_deaths[d].x + _deaths[d].cellChange[0]), 2),
					Math.pow(_player.y + _player.cellChange[1] - (_deaths[d].y + _deaths[d].cellChange[1]), 2)
				);
				console.log(dist);
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
		_drawLevel();
		_worldChanged = false;
	}

	chase.start = function (canvas, isMobile) {
		_isMobile = isMobile;
		_ctx, _currentLevelIndex = 0;

		_canvas = B.$id(canvas);
		_ctx = _canvas.getContext('2d');

		_initLevel();
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
			'map': [
				['','','','','','','','','',''],
				['','','','','','P','','','',''],
				['','','','T','','','','','',''],
				['','','','','','','','','',''],
				['','D','','','','','','T','',''],
				['','','','','','','','','',''],
				['','T','','D','T','','','','',''],
				['','','','','','','','','',''],
				['','','','','','','T','D','',''],
				['','','','','','','','','',''],
				['','','','','','','','','',''],
				['','','','T','','','','','',''],
				['','','','','','','','','',''],
				['','','D','','','','','T','',''],
				['','','','','','','','','',''],
				['','T','','','T','','','','',''],
				['','','','','','','','D','',''],
				['','','','','','','T','','',''],
				['','','','','','','','','','H']
			]
		}
	];

	window.chase = chase;
})();
