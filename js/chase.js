(function () {
	var _ctx, _canvas, chase = {},
		_player, movableClass, playerClass, _deaths = [], deathClass,
		_Geometry,
		_directionsSetup = {},
		_directions = ['down', 'left', 'right', 'up'],
		_worldChanged = true,
		_levels,
		_currentLevel,
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
		_obstacles = [],
		_isMobile

		ANGLE_TOP_RIGHT = 7 * Math.PI / 4,
		ANGLE_TOP_LEFT = 5 * Math.PI / 4,
		ANGLE_BOTTOM_LEFT = 3 * Math.PI / 4,
		ANGLE_BOTTOM_RIGHT = Math.PI / 4;

	_directionsSetup[_directions[0]] = {
		x: 0, y: 2, spriteRow: 0, vAngleStart: ANGLE_BOTTOM_RIGHT, vAngleEnd: ANGLE_BOTTOM_LEFT
	};
	_directionsSetup[_directions[1]] = {
		x: -2, y: 0, spriteRow: 1, vAngleStart: ANGLE_BOTTOM_LEFT, vAngleEnd: ANGLE_TOP_LEFT
	};
	_directionsSetup[_directions[2]] = {
		// This angle overlaps with the angle 0 of the trigonometry circle,
		// so the end angle ends up being smaller than the start angle
		// lets add one whole turn to the angle
		x: 2, y: 0, spriteRow: 2, vAngleStart: ANGLE_TOP_RIGHT, vAngleEnd: ANGLE_BOTTOM_RIGHT + 2 * Math.PI
	};
	_directionsSetup[_directions[3]] = {
		x: 0, y: -2, spriteRow: 3, vAngleStart: ANGLE_TOP_LEFT, vAngleEnd: ANGLE_TOP_RIGHT
	};

	entityClass = function (cellX, cellY, resource) {
		this.cellX = cellX;
		this.cellY = cellY;
		this.x = _getObjectDisplayXFromCell(cellX, resource.w);
		this.y = _getObjectDisplayYFromCell(cellY, resource.h);
		this.w = resource.w;
		this.h = resource.h;
		this.hitbox = new sCape.Geometry.Rectangle(
			this.x + resource.hitbox[0],
			this.y + resource.hitbox[1],
			resource.hitbox[2],
			resource.hitbox[3]
		);
	}

	movableClass = function (cellX, cellY, resource, direction) {
		entityClass.call(this, cellX, cellY, resource);
		this.cellChange = new sCape.Geometry.Point(
			this.x + resource.cellChange[0],
			this.y + resource.cellChange[1]
		);
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
				var o, nbObstacles = _obstacles.length, colliding;
				for (o = 0; o < nbObstacles; ++o) {
					colliding = sCape.Physics.areRectanglesColliding(this.hitbox, _obstacles[o].obstacle.hitbox);

					if (colliding) {
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

		this.detectPlayer = function (distance, angle) {
			var inReach = distance <= this.visionDepth,
				inSight = _directionsSetup[this.direction].vAngleStart <= angle
					&& angle <= _directionsSetup[this.direction].vAngleEnd,
				obstaclesInWay = false, o;

			for (o = 0; o < _obstacles.length; o++) {
				if (_obstacles[o].type !== 'tree') {
					continue;
				}

				obstaclesInWay = obstaclesInWay || sCape.Physics.areSegmentAndRectangleColliding(
					new sCape.Geometry.Segment(
						this.cellChange,
						_player.cellChange
					),
					_obstacles[o].obstacle.hitbox
				);
			}

			if (inReach && inSight && !obstaclesInWay) {
				this.seesPlayer = true;
			}
			else {
				this.seesPlayer = false;
			}
		}
	};

	function _getObjectDisplayXFromCell (cellX, resourceWidth) {
		return cellX * _currentLevel.grid.tileWidth + (_currentLevel.grid.tileWidth - resourceWidth) / 2;
	}

	function _getObjectDisplayYFromCell (cellY, resourceHeight) {
		return cellY * _currentLevel.grid.tileHeight + _currentLevel.grid.tileHeight - resourceHeight;
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
		// the grid has cells of _currentLevel.grid.tileWidth * _currentLevel.grid.tileHeight px
		// there are 4 directions, so 4 rows in the sprite
		// To set the sprite on the middle bottom of the tile
		var spriteStartX = moveFrame ? parseInt(moveFrame) * resource.w : 0,
			spriteStartY = direction ? _directionsSetup[direction].spriteRow * resource.h : 0;

		_ctx.drawImage(
			resource.resource,
			// Start in the sprite board
			spriteStartX, spriteStartY,
			// Dimensions in the sprite board
			resource.w, resource.h,
			// Position in the canvas
			x, y,
			// Dimensions in the canvas
			resource.w, resource.h
		);
	}

	function _createPlayer (x, y) {
		_player = new playerClass(x, y);
	}

	function _createDeath (x, y) {
		var d = new deathClass(x, y, _directions[parseInt(Math.random() * 100) % 4]);
		_deaths.push(d);

		return d;
	}

	function _createTree (x, y) {
		var t = new entityClass(x, y, _resources['tree']);

		return t;
	}

	function _createObstacle (type, obstacle) {
		_obstacles.push({
			'type': type,
			'obstacle': obstacle
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
			death.cellChange.x,
			death.cellChange.y
		);
		_ctx.arc(
			death.cellChange.x,
			death.cellChange.y,
			death.visionDepth,
			_directionsSetup[death.direction].vAngleStart,
			_directionsSetup[death.direction].vAngleEnd
		);
		_ctx.lineTo(
			death.cellChange.x,
			death.cellChange.y
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
		_currentLevel = new sCape.Level(
			new sCape.Grid(
				_levels[_currentLevelIndex].tileWidth,
				_levels[_currentLevelIndex].tileHeight
			)
		);
		_canvas.width = _levels[_currentLevelIndex].map[0].length * _currentLevel.grid.tileWidth;
		_canvas.height = _levels[_currentLevelIndex].map.length * _currentLevel.grid.tileHeight;

		_loopThroughMap({
			'P': function (col, row) {
				_createPlayer(row, col);
			},
			'T': function (col, row) {
				_createObstacle('tree', _createTree(row, col));
			},
			'D': function (col, row) {
				_createObstacle('death', _createDeath(row, col));

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
		var d, newPX, newPY,
			changed;

		if (_player.isMoving()) {
			_player.x += _player.speedX;
			_player.y += _player.speedY;
			_player.hitbox.x += _player.speedX;
			_player.hitbox.y += _player.speedY;
			_worldChanged = true;

			if (_player.isColliding()) {
				_player.x -= _player.speedX;
				_player.y -= _player.speedY;
				_player.hitbox.x -= _player.speedX;
				_player.hitbox.y -= _player.speedY;
				_player.stopMotion();
			}
			else {
				_player.cellChange.x += _player.speedX;
				_player.cellChange.y += _player.speedY;
				_player.moveFrame = (_player.moveFrame + 0.25) % 4;

				newPX = parseInt(_player.cellChange.x / _currentLevel.grid.tileWidth);
				newPY = parseInt(_player.cellChange.y / _currentLevel.grid.tileHeight);
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
				_deaths[d].cellChange.x += _deaths[d].speedX;
				_deaths[d].cellChange.y += _deaths[d].speedY;
				_deaths[d].hitbox.x += _deaths[d].speedX;
				_deaths[d].hitbox.y += _deaths[d].speedY;
				_worldChanged = true;
				_deaths[d].moveFrame = (_deaths[d].moveFrame + 0.25) % 4;
			}
			else {
				changed = _deaths[d].increaseRotationFrequency();
				if (changed) {
					_worldChanged = true;
				}
			}

			if (_worldChanged) {
				var distance, angle;
				// Try to detect player
				distance = Math.sqrt(
					Math.pow(_player.cellChange.x - _deaths[d].cellChange.x, 2)
					+ Math.pow(_player.cellChange.y - _deaths[d].cellChange.y, 2)
				);
				angle = Math.atan2(
					_player.cellChange.y - _deaths[d].cellChange.y,
					_player.cellChange.x - _deaths[d].cellChange.x
				);

				// Hack for to test if the player is in the vision of the death
				// when turned toward the right (to handle the angle 0)
				angle = angle < Math.PI / 4 ? angle + 2 * Math.PI : angle;

				_deaths[d].detectPlayer(distance, angle);
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
			'tileWidth': 48,
			'tileHeight': 24,
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
