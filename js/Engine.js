(function () {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Entities module";
	}

	var _directions,
		_isMobile,
		_worldChanged = true;

	sCape.Engine = {};
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
				sCape.Level.currentLevel.player = _createPlayer(row, col);
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

	sCape.Engine.startPlayerMotion = function (direction) {
		if (!sCape.Engine.directionsSetup[direction]) {
			throw 'Unknown direction: ' + direction;
		}

		sCape.Level.currentLevel.player.startMotion(
			sCape.Engine.directionsSetup[direction]
		);
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
		return new playerClass(x, y, sCape.Engine.directionsSetup['down']);
	}

	function _createDeath (x, y) {
		var deathClass = sCape.data.deathClass || sCape.Entities.deathClass,
			direction = _directions[parseInt(Math.random() * 100) % 4],
			d = new deathClass(x, y, sCape.Engine.directionsSetup[direction]);
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
			changed
			player = sCape.Level.currentLevel.player;

		if (player.isMoving()) {
			player.x += player.speedX;
			player.y += player.speedY;
			player.hitbox.x += player.speedX;
			player.hitbox.y += player.speedY;
			_worldChanged = true;

			if (player.isColliding()) {
				player.x -= player.speedX;
				player.y -= player.speedY;
				player.hitbox.x -= player.speedX;
				player.hitbox.y -= player.speedY;
				player.stopMotion();
			}
			else {
				player.cellChange.x += player.speedX;
				player.cellChange.y += player.speedY;
				player.moveFrame = (player.moveFrame + 0.25) % 4;

				newPX = parseInt(player.cellChange.x / sCape.Level.currentLevel.grid.tileWidth);
				newPY = parseInt(player.cellChange.y / sCape.Level.currentLevel.grid.tileHeight);
				if (sCape.Level.currentLevel.grid.map[newPY][newPX] == '') {
					sCape.Level.currentLevel.grid.map[player.cellY][player.cellX] = '';
					player.cellX = newPX;
					player.cellY = newPY;
					sCape.Level.currentLevel.grid.map[player.cellY][player.cellX] = 'P';
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
					sCape.Engine.deaths[d].direction = sCape.Engine.directionsSetup[
						sCape.Engine.directions[parseInt(Math.random() * 100) % 4]
					];
					_worldChanged = true;
				}
			}

			if (_worldChanged) {
				var distance, angle;
				// Try to detect player
				distance = Math.sqrt(
					Math.pow(player.cellChange.x - sCape.Engine.deaths[d].cellChange.x, 2)
					+ Math.pow(player.cellChange.y - sCape.Engine.deaths[d].cellChange.y, 2)
				);
				angle = Math.atan2(
					player.cellChange.y - sCape.Engine.deaths[d].cellChange.y,
					player.cellChange.x - sCape.Engine.deaths[d].cellChange.x
				);

				// Hack for to test if the player is in the vision of the death
				// when turned toward the right (to handle the angle 0)
				angle = angle < Math.PI / 4 ? angle + 2 * Math.PI : angle;

				sCape.Engine.deaths[d].detectPlayer(player, distance, angle);
			}
		}
	}

	window.sCape = sCape;
})();
