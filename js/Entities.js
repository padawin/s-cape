(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Entities module";
	}

	var entityClass, movableClass, deathClass, playerClass, _directions;

	_directions = ['down', 'left', 'right', 'up'];
	sCape.Entities.directionsSetup = {};

	sCape.Entities.directionsSetup[_directions[0]] = {
		x: 0, y: 1, spriteRow: 0, vAngleStart: sCape.Geometry.ANGLE_BOTTOM_RIGHT, vAngleEnd: sCape.Geometry.ANGLE_BOTTOM_LEFT
	};
	sCape.Entities.directionsSetup[_directions[1]] = {
		x: -1, y: 0, spriteRow: 1, vAngleStart: sCape.Geometry.ANGLE_BOTTOM_LEFT, vAngleEnd: sCape.Geometry.ANGLE_TOP_LEFT
	};
	sCape.Entities.directionsSetup[_directions[2]] = {
		// This angle overlaps with the angle 0 of the trigonometry circle,
		// so the end angle ends up being smaller than the start angle
		// lets add one whole turn to the angle
		x: 1, y: 0, spriteRow: 2, vAngleStart: sCape.Geometry.ANGLE_TOP_RIGHT, vAngleEnd: sCape.Geometry.ANGLE_BOTTOM_RIGHT + 2 * Math.PI
	};
	sCape.Entities.directionsSetup[_directions[3]] = {
		x: 0, y: -1, spriteRow: 3, vAngleStart: sCape.Geometry.ANGLE_TOP_LEFT, vAngleEnd: sCape.Geometry.ANGLE_TOP_RIGHT
	};

	entityClass = function (cellX, cellY, resource) {
		this.resource = resource;

		this.cellX = cellX;
		this.cellY = cellY;
		this.x = sCape.Grid.getObjectDisplayXFromCell(cellX, this.resource.w);
		this.y = sCape.Grid.getObjectDisplayYFromCell(cellY, this.resource.h);
		this.w = this.resource.w;
		this.h = this.resource.h;
		this.hitbox = new sCape.Geometry.Rectangle(
			this.x + this.resource.hitbox[0],
			this.y + this.resource.hitbox[1],
			this.resource.hitbox[2],
			this.resource.hitbox[3]
		);
	};

	movableClass = function (cellX, cellY, resource, direction) {
		entityClass.call(this, cellX, cellY, resource);
		this.extends(entityClass.prototype);
		this.cellChange = new sCape.Geometry.Point(
			this.x + this.resource.cellChange[0],
			this.y + this.resource.cellChange[1]
		);
		this.speedX = 0;
		this.speedY = 0;
		this.moving = false;
		this.moveFrame = 0;
		this.direction = _directionsSetup[direction];
		this.baseSpeed = 1;
	};

	movableClass.prototype.isMoving = function () {
		return this.moving;
	};

	movableClass.prototype.startMotion = function (direction) {
		if (this.isMoving()) {
			this.stopMotion();
		}

		this.direction = direction;
		this.moving = true;
		this.speedX = direction.x * this.baseSpeed;
		this.speedY = direction.y * this.baseSpeed;
	};

	movableClass.prototype.stopMotion = function () {
		this.moving = false;
		this.speedX = 0;
		this.speedY = 0;
		this.moveFrame = 0;
	};

	movableClass.prototype.isColliding = function () {
		// Map borders
		if (this.x < 0
			|| this.y < 0
			|| this.x + this.w > sCape.GUI.canvas.width
			|| this.y + this.h > sCape.GUI.canvas.height
		) {
			return true;
		}
		// Object in map
		else {
			var o, nbObstacles = sCape.Level.currentLevel.obstacles.length, colliding;
			for (o = 0; o < nbObstacles; ++o) {
				if (sCape.Level.currentLevel.obstacles[o].obstacle === this) {
					continue;
				}
				colliding = sCape.Physics.areRectanglesColliding(this.hitbox, sCape.Level.currentLevel.obstacles[o].obstacle.hitbox);

				if (colliding) {
					return true;
				}
			}
		}

		return false;
	};

	movableClass.prototype.updatePosition = function () {
		this.changedCell = false;
		if (this.isMoving()) {
			this.x += this.speedX;
			this.y += this.speedY;
			this.hitbox.x += this.speedX;
			this.hitbox.y += this.speedY;

			if (this.isColliding()) {
				this.x -= this.speedX;
				this.y -= this.speedY;
				this.hitbox.x -= this.speedX;
				this.hitbox.y -= this.speedY;
				this.stopMotion();
			}
			else {
				this.cellChange.x += this.speedX;
				this.cellChange.y += this.speedY;
				this.moveFrame = (this.moveFrame + 0.25) % 4;

				var newPX = parseInt(this.cellChange.x / sCape.Level.currentLevel.grid.tileWidth),
					newPY = parseInt(this.cellChange.y / sCape.Level.currentLevel.grid.tileHeight),
					symbol = sCape.Level.currentLevel.grid.map[this.cellY][this.cellX];
				if (sCape.Level.currentLevel.grid.map[newPY][newPX] == '') {
					sCape.Level.currentLevel.grid.map[this.cellY][this.cellX] = '';
					this.cellX = newPX;
					this.cellY = newPY;
					sCape.Level.currentLevel.grid.map[this.cellY][this.cellX] = symbol;
					this.changedCell = true;
				}
			}

			return true;
		}

		return false;
	};

	deathClass = function (x, y, direction) {
		movableClass.call(this, x, y, sCape.data.resources['death'], direction);
		this.extends(movableClass.prototype);
		this.rotationFrequency = parseInt(Math.random() * (1000 - 100 + 1)) + 100;
		this.frameBeforeRotation = 1;
		this.seesPlayer = false;
		this.baseSpeed = 3;

		this.visionDepth = 100;

		this.updatePosition = function () {
			var targetCoordinates,
				nextTargetVector;
			if (this.path != null) {
				if (this.nextTarget == null ||
					this.x == this.nextTarget.x
					&& this.y == this.nextTarget.y
				) {
					this.nextTarget = this.path.shift();

					if (this.nextTarget === undefined) {
						this.stopChasing();
					}

					if (this.nextTarget) {
						this.nextTarget.x = this.nextTarget.content == 'D' ? this.x : sCape.Grid.getObjectDisplayXFromCell(this.nextTarget.cellX, this.w);
						this.nextTarget.y = this.nextTarget.content == 'D' ? this.y : sCape.Grid.getObjectDisplayYFromCell(this.nextTarget.cellY, this.h);
					}
				}
			}

			// if has a next target
			if (this.nextTarget) {
				// get direction towards next target
				nextTargetVector = {
					x: this.nextTarget.x - this.x,
					y: this.nextTarget.y - this.y
				};

				// target on the left
				if (nextTargetVector.x < 0) {
					this.startMotion(sCape.Entities.directionsSetup.left);
					this.speedX = Math.max(this.speedX, nextTargetVector.x);
				}
				// target on the right
				else if (nextTargetVector.x > 0) {
					this.startMotion(sCape.Entities.directionsSetup.right);
					this.speedX = Math.min(this.speedX, nextTargetVector.x);
				}
				// target above
				else if (nextTargetVector.y < 0) {
					this.startMotion(sCape.Entities.directionsSetup.up);
					this.speedY = Math.max(this.speedY, nextTargetVector.y);
				}
				// target below
				else if (nextTargetVector.y > 0) {
					this.startMotion(sCape.Entities.directionsSetup.down);
					this.speedY = Math.min(this.speedY, nextTargetVector.y);
				}
			}

			return sCape.Entities.movableClass.prototype.updatePosition.call(this);
		};
	};

	deathClass.prototype.increaseRotationFrequency = function () {
		this.frameBeforeRotation = (this.frameBeforeRotation + 1) % this.rotationFrequency;
		return this.frameBeforeRotation == 0;
	};

	deathClass.prototype.detectPlayer = function (player) {
		var distance, angle, inReach, inSight, obstaclesInWay, o;
		// Try to detect player
		distance = Math.sqrt(
			Math.pow(player.cellChange.x - this.cellChange.x, 2)
			+ Math.pow(player.cellChange.y - this.cellChange.y, 2)
		);
		angle = Math.atan2(
			player.cellChange.y - this.cellChange.y,
			player.cellChange.x - this.cellChange.x
		);

		// Hack for to test if the player is in the vision of the death
		// when turned toward the right (to handle the angle 0)
		angle = angle < Math.PI / 4 ? angle + 2 * Math.PI : angle;
		inReach = distance <= this.visionDepth;
		inSight = this.direction.vAngleStart <= angle && angle <= this.direction.vAngleEnd;
		obstaclesInWay = false;

		for (o = 0; o < sCape.Level.currentLevel.obstacles.length; o++) {
			if (sCape.Level.currentLevel.obstacles[o].type == 'death') {
				continue;
			}

			obstaclesInWay = obstaclesInWay || sCape.Physics.areSegmentAndRectangleColliding(
				new sCape.Geometry.Segment(
					this.cellChange,
					player.cellChange
				),
				sCape.Level.currentLevel.obstacles[o].obstacle.hitbox
			);
		}

		if (inReach && inSight && !obstaclesInWay) {
			this.seesPlayer = true;
		}
		else {
			this.seesPlayer = false;
		}
	};

	deathClass.prototype.chase = function (path) {
		this.path = path;
		this.nextTarget = null;
	};

	deathClass.prototype.stopChasing = function () {
		this.stopMotion();
		this.path = null;
		this.nextTarget = null;
	};

	deathClass.prototype.isChasing = function () {
		return this.path && this.path.length || this.nextTarget;
	};

	deathClass.prototype.changeDirection = function () {
		this.direction = _directionsSetup[
			_directions[parseInt(Math.random() * 100) % 4]
		];
	};

	playerClass = function (x, y, direction) {
		movableClass.call(this, x, y, sCape.data.resources['player'], direction);
		sCape.EventsManager.on('event.action-on-screen', this, function (x, y) {
			var trigoX, trigoY, touchRatio, canvasRatio;
				trigoX = x - this.cellChange.x;
				trigoY = -1 * y + this.cellChange.y;

			touchRatio = Math.abs(trigoY / trigoX);
			canvasRatio = sCape.GUI.canvas.height / sCape.GUI.canvas.width;
			if (trigoY > 0 && touchRatio > canvasRatio) {
				sCape.Level.currentLevel.player.startMotion(
					sCape.Entities.directionsSetup.up
				);
			}
			else if (trigoY < 0 && touchRatio > canvasRatio) {
				sCape.Level.currentLevel.player.startMotion(
					sCape.Entities.directionsSetup.down
				);
			}
			else if (trigoX > 0) {
				sCape.Level.currentLevel.player.startMotion(
					sCape.Entities.directionsSetup.right
				);
			}
			else {
				sCape.Level.currentLevel.player.startMotion(
					sCape.Entities.directionsSetup.left
				);
			}
		});

		sCape.EventsManager.on('event.action-off-screen', this, function () {
			if (this.isMoving()) {
				_worldChanged = true;
				this.stopMotion();
			}
		});
		this.extends(movableClass.prototype);

		this.baseSpeed = 2;
	};

	sCape.Entities = {
		entityClass: entityClass,

		movableClass: movableClass,

		playerClass: playerClass,

		deathClass: deathClass
	};
})(sCape);
