(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Entities module";
	}

	sCape.Entities = {
		entityClass: function (cellX, cellY, resource) {
			this.cellX = cellX;
			this.cellY = cellY;
			this.x = sCape.Grid.getObjectDisplayXFromCell(cellX, resource.w);
			this.y = sCape.Grid.getObjectDisplayYFromCell(cellY, resource.h);
			this.w = resource.w;
			this.h = resource.h;
			this.hitbox = new sCape.Geometry.Rectangle(
				this.x + resource.hitbox[0],
				this.y + resource.hitbox[1],
				resource.hitbox[2],
				resource.hitbox[3]
			);
		},

		movableClass: function (cellX, cellY, resource, direction) {
			sCape.Entities.entityClass.call(this, cellX, cellY, resource);
			this.cellChange = new sCape.Geometry.Point(
				this.x + resource.cellChange[0],
				this.y + resource.cellChange[1]
			);
			this.speedX = 0;
			this.speedY = 0;
			this.moving = false;
			this.moveFrame = 0;
			this.direction = direction;

			this.isMoving = function () {
				return this.moving;
			};

			this.startMotion = function (direction) {
				if (this.isMoving()) {
					return;
				}

				this.direction = direction;
				this.moving = true;
				this.speedX = direction.x;
				this.speedY = direction.y;
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
					var o, nbObstacles = sCape.Level.currentLevel.obstacles.length, colliding;
					for (o = 0; o < nbObstacles; ++o) {
						colliding = sCape.Physics.areRectanglesColliding(this.hitbox, sCape.Level.currentLevel.obstacles[o].obstacle.hitbox);

						if (colliding) {
							return true;
						}
					}
				}

				return false;
			};

			this.updatePosition = function () {
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
							newPY = parseInt(this.cellChange.y / sCape.Level.currentLevel.grid.tileHeight);
						if (sCape.Level.currentLevel.grid.map[newPY][newPX] == '') {
							sCape.Level.currentLevel.grid.map[this.cellY][this.cellX] = '';
							this.cellX = newPX;
							this.cellY = newPY;
							sCape.Level.currentLevel.grid.map[this.cellY][this.cellX] = 'P';
						}
					}

					return true;
				}

				return false;
			};
		},

		playerClass: function (x, y, direction) {
			sCape.Entities.movableClass.call(this, x, y, sCape.data.resources['player'], direction);
		},

		deathClass: function (x, y, direction) {
			sCape.Entities.movableClass.call(this, x, y, sCape.data.resources['death'], direction);
			this.rotationFrequency = parseInt(Math.random() * (1000 - 100 + 1)) + 100;
			this.frameBeforeRotation = 1;
			this.seesPlayer = false;

			this.visionDepth = 100;

			this.increaseRotationFrequency = function () {
				this.frameBeforeRotation = (this.frameBeforeRotation + 1) % this.rotationFrequency;
				return this.frameBeforeRotation == 0;
			};

			this.detectPlayer = function (player, distance, angle) {
				var inReach = distance <= this.visionDepth,
					inSight = this.direction.vAngleStart <= angle
						&& angle <= this.direction.vAngleEnd,
					obstaclesInWay = false, o;

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

			this.chase = function (path) {
				this.path = path;
				this.nextTarget = null;
			};

			this.updatePosition = function () {
				// if has a path and (no next target or on the position of the next target
				//		next target = pop path
				var targetCoordinates,
					nextTargetVector,
					nextTargetX, nextTargetY;
				if (this.path != null &&
					(this.nextTarget == null ||
						this.x == (nextTargetX = sCape.Grid.getObjectDisplayXFromCell(this.nextTarget.cellX, resource.w))
						&& this.y == (nextTargetY = sCape.Grid.getObjectDisplayYFromCell(this.nextTarget.cellY, resource.h))
					)
				) {
					this.nextTarget = this.path.shift();
				}

				// if has a next target
				if (this.nextTarget) {
					// get direction towards next target
					nextTargetVector = {
						x: nextTargetX - this.x,
						y: nextTargetY - this.y
					};

					// target on the left
					if (nextTargetVector.x < 0) {
						this.startMotion(sCape.Engine.directionsSetup.left);
						this.speedX = Math.max(this.speedX, nextTargetVector.x);
					}
					// target on the right
					else if (nextTargetVector.x > 0) {
						this.startMotion(sCape.Engine.directionsSetup.right);
						this.speedX = Math.min(this.speedX, nextTargetVector.x);
					}
					// target above
					if (nextTargetVector.y < 0) {
						this.startMotion(sCape.Engine.directionsSetup.up);
						this.speedY = Math.max(this.speedY, nextTargetVector.y);
					}
					// target below
					else if (nextTargetVector.y > 0) {
						this.startMotion(sCape.Engine.directionsSetup.down);
						this.speedY = Math.min(this.speedY, nextTargetVector.y);
					}
				}

				sCape.Entities.movableClass.prototype.updatePosition.call(this);
			};
		}
	};
})(sCape);
