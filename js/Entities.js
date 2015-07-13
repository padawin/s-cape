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
			this.direction = direction || 'down';

			this.isMoving = function () {
				return this.moving;
			};

			this.startMotion = function (direction) {
				if (this.isMoving()) {
					return;
				}

				if (!sCape.Engine.directionsSetup[direction]) {
					throw 'Unknown direction: ' + direction;
				}

				this.direction = direction;
				this.moving = true;
				this.speedX = sCape.Engine.directionsSetup[direction].x;
				this.speedY = sCape.Engine.directionsSetup[direction].y;
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
				if (this.frameBeforeRotation == 0) {
					this.direction = sCape.Engine.directions[parseInt(Math.random() * 100) % 4];
					return true;
				}

				return false;
			};

			this.detectPlayer = function (player, distance, angle) {
				var inReach = distance <= this.visionDepth,
					inSight = sCape.Engine.directionsSetup[this.direction].vAngleStart <= angle
						&& angle <= sCape.Engine.directionsSetup[this.direction].vAngleEnd,
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
			}
		}
	};
})(sCape);
