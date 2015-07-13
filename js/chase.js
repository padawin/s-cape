(function () {
	var chase = {},
		_player, movableClass, playerClass, _deaths = [], deathClass,
		_Geometry,
		_directionsSetup = {},
		_directions = ['down', 'left', 'right', 'up'],
		_worldChanged = true,
		_currentLevelIndex,
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
				|| this.x + this.w == sCape.GUI.canvas.width
				|| this.y + this.h == sCape.GUI.canvas.height
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
		movableClass.call(this, x, y, sCape.data.resources['player'], direction);
	};

	deathClass = function (x, y, direction) {
		movableClass.call(this, x, y, sCape.data.resources['death'], direction);
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
		return cellX * sCape.Level.currentLevel.grid.tileWidth + (sCape.Level.currentLevel.grid.tileWidth - resourceWidth) / 2;
	}

	function _getObjectDisplayYFromCell (cellY, resourceHeight) {
		return cellY * sCape.Level.currentLevel.grid.tileHeight + sCape.Level.currentLevel.grid.tileHeight - resourceHeight;
	}

	function _drawBackground () {
		var img = sCape.data.resources.grass.resource,
			pattern = sCape.GUI.ctx.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
		sCape.GUI.ctx.fillStyle = pattern;
		sCape.GUI.ctx.fillRect(0, 0, sCape.GUI.canvas.width, sCape.GUI.canvas.height); // context.fillRect(x, y, width, height);
	}

	function _draw (x, y, resource, direction, moveFrame) {
		var resource = sCape.data.resources[resource];
		// the animations have 4 frames
		// the grid has cells of sCape.Level.currentLevel.grid.tileWidth * sCape.Level.currentLevel.grid.tileHeight px
		// there are 4 directions, so 4 rows in the sprite
		// To set the sprite on the middle bottom of the tile
		var spriteStartX = moveFrame ? parseInt(moveFrame) * resource.w : 0,
			spriteStartY = direction ? _directionsSetup[direction].spriteRow * resource.h : 0;

		sCape.GUI.ctx.drawImage(
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
		var t = new entityClass(x, y, sCape.data.resources['tree']);

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
			_getObjectDisplayXFromCell(cellX, sCape.data.resources['tree'].w),
			_getObjectDisplayYFromCell(cellY, sCape.data.resources['tree'].h),
			'tree'
		);
	}

	function _drawHome (x, y) {

	}

	function _drawDeath (death) {
		if (death.seesPlayer) {
			sCape.GUI.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
		}
		else {
			sCape.GUI.ctx.fillStyle = 'rgba(0, 150, 0, 0.5)';
		}
		sCape.GUI.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		sCape.GUI.ctx.beginPath();
		sCape.GUI.ctx.moveTo(
			death.cellChange.x,
			death.cellChange.y
		);
		sCape.GUI.ctx.arc(
			death.cellChange.x,
			death.cellChange.y,
			death.visionDepth,
			_directionsSetup[death.direction].vAngleStart,
			_directionsSetup[death.direction].vAngleEnd
		);
		sCape.GUI.ctx.lineTo(
			death.cellChange.x,
			death.cellChange.y
		);
		sCape.GUI.ctx.fill();
		sCape.GUI.ctx.stroke();
		sCape.GUI.ctx.closePath();

		_draw(
			death.x, death.y, 'death',
			death.direction, death.moveFrame
		);
	}

	function _drawLevel (level) {
		var d = 0;

		level.grid.loopThroughMap({
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
		var grid = new sCape.Grid(
			sCape.data.levels[_currentLevelIndex].tileWidth,
			sCape.data.levels[_currentLevelIndex].tileHeight,
			sCape.data.levels[_currentLevelIndex].map
		);
		sCape.GUI.canvas.width = grid.map[0].length * grid.tileWidth;
		sCape.GUI.canvas.height = grid.map.length * grid.tileHeight;

		sCape.Level.currentLevel = new sCape.Level(grid);
		grid.loopThroughMap({
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
				trigoX = e.touches[0].clientX - sCape.GUI.canvas.width / 2;
				trigoY = -1 * e.touches[0].clientY + sCape.GUI.canvas.height / 2;
				touchRatio = Math.abs(trigoY / trigoX);
				canvasRatio = sCape.GUI.canvas.height / sCape.GUI.canvas.width;
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

			B.addEvent(sCape.GUI.canvas, 'touchstart', _touchEvent);

			B.addEvent(sCape.GUI.canvas, 'touchmove', _touchEvent);

			B.addEvent(sCape.GUI.canvas, 'touchend', function (e) {
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
		var r, loaded = 0, loadingWidth = 0.70 * sCape.GUI.canvas.width;

		// rect starts from 15% from the border of the canvas
		sCape.GUI.ctx.rect(
			0.15 * sCape.GUI.canvas.width, sCape.GUI.canvas.height / 2 - 10,
			loadingWidth, 20
		);
		sCape.GUI.ctx.stroke();

		for (r in sCape.data.resources) {
			if (sCape.data.resources.hasOwnProperty(r)) {
				sCape.data.resources[r].resource = new Image();
				sCape.data.resources[r].resource.src = sCape.data.resources[r].url;
				sCape.data.resources[r].resource.onload = function () {
					if (++loaded == sCape.data.nbResources) {
						loadedCallback();
					}
					else {
						sCape.GUI.ctx.fillRect(
							0.15 * sCape.GUI.canvas.width, sCape.GUI.canvas.height / 2 - 10,
							loadingWidth * loaded / sCape.data.nbResources, 20
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

				newPX = parseInt(_player.cellChange.x / sCape.Level.currentLevel.grid.tileWidth);
				newPY = parseInt(_player.cellChange.y / sCape.Level.currentLevel.grid.tileHeight);
				if (sCape.Level.currentLevel.grid.map[newPY][newPX] == '') {
					sCape.Level.currentLevel.grid.map[_player.cellY][_player.cellX] = '';
					_player.cellX = newPX;
					_player.cellY = newPY;
					sCape.Level.currentLevel.grid.map[_player.cellY][_player.cellX] = 'P';
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
		_drawLevel(sCape.Level.currentLevel);
		_worldChanged = false;
	}

	chase.start = function (canvas, isMobile) {
		_isMobile = isMobile;
		_currentLevelIndex = 0;

		sCape.GUI.init(B.$id(canvas));

		_initLevel();
		_loadResources(function () {
			_initEvents();

			_startMainLoop();
		});
	};

	window.chase = chase;
})();
