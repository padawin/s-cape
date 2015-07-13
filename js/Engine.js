(function () {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Entities module";
	}

	var _directions,
		_isMobile,
		_worldChanged = true;

	sCape.Engine = {};
	sCape.Engine.player = null;
	sCape.Engine.deaths = [];
	_directions = ['down', 'left', 'right', 'up'];
	sCape.Engine.directions = _directions;
	sCape.Engine.directionsSetup = {};


	sCape.Engine.directionsSetup[_directions[0]] = {
		x: 0, y: 2, spriteRow: 0, vAngleStart: sCape.Geometry.ANGLE_BOTTOM_RIGHT, vAngleEnd: sCape.Geometry.ANGLE_BOTTOM_LEFT
	};
	sCape.Engine.directionsSetup[_directions[1]] = {
		x: -2, y: 0, spriteRow: 1, vAngleStart: sCape.Geometry.ANGLE_BOTTOM_LEFT, vAngleEnd: sCape.Geometry.ANGLE_TOP_LEFT
	};
	sCape.Engine.directionsSetup[_directions[2]] = {
		// This angle overlaps with the angle 0 of the trigonometry circle,
		// so the end angle ends up being smaller than the start angle
		// lets add one whole turn to the angle
		x: 2, y: 0, spriteRow: 2, vAngleStart: sCape.Geometry.ANGLE_TOP_RIGHT, vAngleEnd: sCape.Geometry.ANGLE_BOTTOM_RIGHT + 2 * Math.PI
	};
	sCape.Engine.directionsSetup[_directions[3]] = {
		x: 0, y: -2, spriteRow: 3, vAngleStart: sCape.Geometry.ANGLE_TOP_LEFT, vAngleEnd: sCape.Geometry.ANGLE_TOP_RIGHT
	};

	sCape.Engine.initLevel = function (levelIndex) {
		var grid = new sCape.Grid(
			sCape.data.levels[levelIndex].tileWidth,
			sCape.data.levels[levelIndex].tileHeight,
			sCape.data.levels[levelIndex].map
		);
		sCape.GUI.canvas.width = grid.map[0].length * grid.tileWidth;
		sCape.GUI.canvas.height = grid.map.length * grid.tileHeight;

		sCape.Level.currentLevel = new sCape.Level(grid);
		grid.loopThroughMap({
			'P': function (col, row) {
				sCape.Engine.player = _createPlayer(row, col);
			},
			'T': function (col, row) {
				sCape.Level.currentLevel.createObstacle('tree', _createTree(row, col));
			},
			'D': function (col, row) {
				sCape.Level.currentLevel.createObstacle('death', _createDeath(row, col));

			}
		});
	};

	sCape.Engine.loadResources = function (loadedCallback) {
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
	};

	sCape.Engine.startMainLoop = function () {

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
	};

	function _createPlayer (x, y) {
		var playerClass = sCape.data.playerClass || sCape.Entities.playerClass;
		return new playerClass(x, y);
	}

	function _createDeath (x, y) {
		var deathClass = sCape.data.deathClass || sCape.Entities.deathClass,
			d = new deathClass(x, y, _directions[parseInt(Math.random() * 100) % 4]);
		sCape.Engine.deaths.push(d);
		return d;
	}

	function _createTree (x, y) {
		var t = new sCape.Entities.entityClass(x, y, sCape.data.resources['tree']);

		return t;
	}

	/**
	 * Redraw the scene if any entity moved
	 */
	function _updateScene () {
		if (!_worldChanged) {
			return;
		}

		sCape.GUI.drawBackground('grass');
		sCape.GUI.drawLevel(sCape.Level.currentLevel);
		_worldChanged = false;
	};

	/**
	 * Update the position of the movable entities
	 * May contain factorizable calculations
	 */
	function _updateState () {
		var d, newPX, newPY,
			changed;

		if (sCape.Engine.player.isMoving()) {
			sCape.Engine.player.x += sCape.Engine.player.speedX;
			sCape.Engine.player.y += sCape.Engine.player.speedY;
			sCape.Engine.player.hitbox.x += sCape.Engine.player.speedX;
			sCape.Engine.player.hitbox.y += sCape.Engine.player.speedY;
			_worldChanged = true;

			if (sCape.Engine.player.isColliding()) {
				sCape.Engine.player.x -= sCape.Engine.player.speedX;
				sCape.Engine.player.y -= sCape.Engine.player.speedY;
				sCape.Engine.player.hitbox.x -= sCape.Engine.player.speedX;
				sCape.Engine.player.hitbox.y -= sCape.Engine.player.speedY;
				sCape.Engine.player.stopMotion();
			}
			else {
				sCape.Engine.player.cellChange.x += sCape.Engine.player.speedX;
				sCape.Engine.player.cellChange.y += sCape.Engine.player.speedY;
				sCape.Engine.player.moveFrame = (sCape.Engine.player.moveFrame + 0.25) % 4;

				newPX = parseInt(sCape.Engine.player.cellChange.x / sCape.Level.currentLevel.grid.tileWidth);
				newPY = parseInt(sCape.Engine.player.cellChange.y / sCape.Level.currentLevel.grid.tileHeight);
				if (sCape.Level.currentLevel.grid.map[newPY][newPX] == '') {
					sCape.Level.currentLevel.grid.map[sCape.Engine.player.cellY][sCape.Engine.player.cellX] = '';
					sCape.Engine.player.cellX = newPX;
					sCape.Engine.player.cellY = newPY;
					sCape.Level.currentLevel.grid.map[sCape.Engine.player.cellY][sCape.Engine.player.cellX] = 'P';
				}
			}
		}

		for (d = 0; d < sCape.Engine.deaths.length; d++) {
			if (sCape.Engine.deaths[d].isMoving()) {
				sCape.Engine.deaths[d].x += sCape.Engine.deaths[d].speedX;
				sCape.Engine.deaths[d].y += sCape.Engine.deaths[d].speedY;
				sCape.Engine.deaths[d].cellChange.x += sCape.Engine.deaths[d].speedX;
				sCape.Engine.deaths[d].cellChange.y += sCape.Engine.deaths[d].speedY;
				sCape.Engine.deaths[d].hitbox.x += sCape.Engine.deaths[d].speedX;
				sCape.Engine.deaths[d].hitbox.y += sCape.Engine.deaths[d].speedY;
				_worldChanged = true;
				sCape.Engine.deaths[d].moveFrame = (sCape.Engine.deaths[d].moveFrame + 0.25) % 4;
			}
			else {
				changed = sCape.Engine.deaths[d].increaseRotationFrequency();
				if (changed) {
					_worldChanged = true;
				}
			}

			if (_worldChanged) {
				var distance, angle;
				// Try to detect player
				distance = Math.sqrt(
					Math.pow(sCape.Engine.player.cellChange.x - sCape.Engine.deaths[d].cellChange.x, 2)
					+ Math.pow(sCape.Engine.player.cellChange.y - sCape.Engine.deaths[d].cellChange.y, 2)
				);
				angle = Math.atan2(
					sCape.Engine.player.cellChange.y - sCape.Engine.deaths[d].cellChange.y,
					sCape.Engine.player.cellChange.x - sCape.Engine.deaths[d].cellChange.x
				);

				// Hack for to test if the player is in the vision of the death
				// when turned toward the right (to handle the angle 0)
				angle = angle < Math.PI / 4 ? angle + 2 * Math.PI : angle;

				sCape.Engine.deaths[d].detectPlayer(sCape.Engine.player, distance, angle);
			}
		}
	}

	window.sCape = sCape;
})();
