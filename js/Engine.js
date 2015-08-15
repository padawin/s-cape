(function () {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Engine module";
	}

	var _directions,
		_isMobile,
		_worldChanged = true;

	sCape.Engine = {};

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
		return new playerClass(x, y, 'down');
	}

	function _createDeath (x, y) {
		var deathClass = sCape.data.deathClass || sCape.Entities.deathClass,
			direction = _directions[parseInt(Math.random() * 100) % 4],
			d = new deathClass(x, y, direction);
		sCape.Level.currentLevel.deaths.push(d);
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
		var d,
			changed,
			player = sCape.Level.currentLevel.player,
			deaths = sCape.Level.currentLevel.deaths;

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
					var path = sCape.PathFinding.shortestPath(
						sCape.Level.currentLevel.grid,
						deaths[d],
						player
					);

					deaths[d].chase(path);
				}
			}
		}
	}

	window.sCape = sCape;
})();
