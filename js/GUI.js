(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the GUI module";
	}

	sCape.GUI = {
		init: function (canvasElement) {
			sCape.GUI.canvas = canvasElement;
			sCape.GUI.ctx = sCape.GUI.canvas.getContext('2d');
		},

		drawPlayer: function () {
			sCape.GUI.draw(
				sCape.Level.currentLevel.player.x, sCape.Level.currentLevel.player.y,
				'player', sCape.Level.currentLevel.player.direction, sCape.Level.currentLevel.player.moveFrame
			);
		},

		drawTree: function (cellX, cellY) {
			sCape.GUI.draw(
				sCape.Grid.getObjectDisplayXFromCell(cellX, sCape.data.resources['tree'].w),
				sCape.Grid.getObjectDisplayYFromCell(cellY, sCape.data.resources['tree'].h),
				'tree'
			);
		},

		drawDeath: function (death) {
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
				death.direction.vAngleStart,
				death.direction.vAngleEnd
			);
			sCape.GUI.ctx.lineTo(
				death.cellChange.x,
				death.cellChange.y
			);
			sCape.GUI.ctx.fill();
			sCape.GUI.ctx.stroke();
			sCape.GUI.ctx.closePath();

			sCape.GUI.draw(
				death.x, death.y, 'death',
				death.direction, death.moveFrame
			);
		},

		drawLevel: function (level) {
			var d = 0;

			level.grid.loopThroughMap({
				'P': function (col, row) {
					sCape.GUI.drawPlayer();
				},
				'T': function (col, row) {
					sCape.GUI.drawTree(row, col);
				},
				'D': function (col, row) {
					sCape.GUI.drawDeath(sCape.Engine.deaths[d]);
					++d;
				}
			});
		},

		drawBackground: function (bgResource) {
			var img = sCape.data.resources[bgResource].resource,
				pattern = sCape.GUI.ctx.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
			sCape.GUI.ctx.fillStyle = pattern;
			sCape.GUI.ctx.fillRect(0, 0, sCape.GUI.canvas.width, sCape.GUI.canvas.height); // context.fillRect(x, y, width, height);
		},

		draw: function (x, y, resource, direction, moveFrame) {
			var resource = sCape.data.resources[resource];
			// the animations have 4 frames
			// the grid has cells of sCape.Level.currentLevel.grid.tileWidth * sCape.Level.currentLevel.grid.tileHeight px
			// there are 4 directions, so 4 rows in the sprite
			// To set the sprite on the middle bottom of the tile
			var spriteStartX = moveFrame ? parseInt(moveFrame) * resource.w : 0,
				spriteStartY = direction ? direction.spriteRow * resource.h : 0;

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
	};
})(sCape);

