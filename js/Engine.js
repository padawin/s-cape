sCape.addModule('Engine',
	'data', 'GUI', 'Level', 'Entities', 'PathFinding',
function (data, GUI, Level, Entities, PathFinding) {
	var _isMobile,
		_worldChanged = true,
		Engine = {};

	function _createPlayer (x, y) {
		var playerClass = data.playerClass || Entities.playerClass;
		return new playerClass(x, y, 'down');
	}

	function _createDeath (x, y) {
		var deathClass = data.deathClass || Entities.deathClass,
			d = new deathClass(x, y);
		Level.currentLevel.deaths.push(d);
		return d;
	}

	function _createTree (x, y) {
		var t = new Entities.entityClass(x, y, data.resources['tree']);

		return t;
	}

	/**
	 * Redraw the scene if any entity moved
	 */
	function _updateScene () {
		if (!_worldChanged) {
			return;
		}

		GUI.drawBackground('grass');
		GUI.drawLevel(Level.currentLevel);
		_worldChanged = false;
	};

	/**
	 * Update the position of the movable entities
	 * May contain factorizable calculations
	 */
	function _updateState () {
		var d,
			changed,
			player = Level.currentLevel.player,
			deaths = Level.currentLevel.deaths;

		_worldChanged = _worldChanged || player.updatePosition();

		for (d = 0; d < deaths.length; d++) {
			if (!deaths[d].updatePosition()) {
				changed = deaths[d].increaseRotationFrequency();
				if (changed) {
					deaths[d].changeDirection();
					_worldChanged = true;
				}
			}
			else {
				_worldChanged = true;
			}

			if (_worldChanged) {
				deaths[d].detectPlayer(player);

				if (deaths[d].seesPlayer
					&& (
						!deaths[d].isChasing()
						|| player.changedCell
					)
				) {
					var path = PathFinding.shortestPath(
						Level.currentLevel.grid,
						deaths[d],
						player
					);

					deaths[d].chase(path);
				}
			}
		}
	}

	Engine.initLevel = function (levelIndex) {
		// Create them differently, via calling new somewhere else
		var grid = new Level.Grid(
			data.levels[levelIndex].tileWidth,
			data.levels[levelIndex].tileHeight,
			data.levels[levelIndex].map
		);
		GUI.canvas.width = grid.map[0].length * grid.tileWidth;
		GUI.canvas.height = grid.map.length * grid.tileHeight;

		Level.currentLevel = new Level(grid);
		grid.loopThroughMap({
			'P': function (col, row) {
				Level.currentLevel.player = _createPlayer(row, col);
			},
			'T': function (col, row) {
				Level.currentLevel.createObstacle('tree', _createTree(row, col));
			},
			'D': function (col, row) {
				Level.currentLevel.createObstacle('death', _createDeath(row, col));

			}
		});
	};

	/**
	 * Use events to display loading bar
	 */
	Engine.loadResources = function (loadedCallback) {
		var r, loaded = 0, loadingWidth = 0.70 * GUI.canvas.width;

		// rect starts from 15% from the border of the canvas
		GUI.ctx.rect(
			0.15 * GUI.canvas.width, GUI.canvas.height / 2 - 10,
			loadingWidth, 20
		);
		GUI.ctx.stroke();

		for (r in data.resources) {
			if (data.resources.hasOwnProperty(r)) {
				data.resources[r].resource = new Image();
				data.resources[r].resource.src = data.resources[r].url;
				data.resources[r].resource.onload = function () {
					if (++loaded == data.nbResources) {
						loadedCallback();
					}
					else {
						GUI.ctx.fillRect(
							0.15 * GUI.canvas.width, GUI.canvas.height / 2 - 10,
							loadingWidth * loaded / data.nbResources, 20
						);
					}
				};
			}
		}
	};

	Engine.startMainLoop = function () {
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


	return Engine;
});
