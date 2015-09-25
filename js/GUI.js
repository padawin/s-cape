if (typeof (require) != 'undefined') {
	var sCape = require('./sCape.js').sCape;
}

sCape.addModule('GUI', 'Events', 'Level', 'data', function (Events, Level, data) {
	function _drawButton(ctx, y, button) {
		GUI.ctx.fillStyle = '#E0995E';

		ctx.font = "30px Arial";
		var textSize = ctx.measureText(button.text);
		// Button border
		GUI.ctx.fillRect((GUI.canvas.width - textSize.width) / 2 - 5, y, textSize.width + 10, 40);
		// Button background
		GUI.ctx.strokeRect((GUI.canvas.width - textSize.width) / 2 - 5, y, textSize.width + 10, 40);
		GUI.ctx.fillStyle = '#000';
		// Button text
		GUI.ctx.fillText(button.text, (GUI.canvas.width - textSize.width) / 2, y + 30);

		return {
			x: (GUI.canvas.width - textSize.width) / 2,
			y: y,
			w: textSize.width + 10,
			h: 40
		};
	}

	var GUI = {
		init: function (canvasElement, width, height) {
			GUI.canvas = canvasElement;
			GUI.canvas.width = width;
			GUI.canvas.height = height;
			GUI.ctx = GUI.canvas.getContext('2d');
		},

		drawMenu: function (menu) {
			// draw background
			GUI.ctx.fillStyle = '#734B4B';
			GUI.ctx.fillRect(0, 0, GUI.canvas.width, GUI.canvas.height); // context.fillRect(x, y, width, height);

			var y = 100;
			for (var i = 0; i < menu.length; i++) {
				menu[i].coordinates = _drawButton(GUI.ctx, y, menu[i]);
				Events.on('event.clickbutton', menu[i], menu[i].event);
				y = menu[i].coordinates.h + menu[i].coordinates.y + 20;
			}

			Events.on('event.action-on-screen', menu, function (x, y) {
				for (var m = 0; m < this.length; m++) {
					if (x >= this[m].coordinates.x && x <= this[m].coordinates.x + this[m].coordinates.w
						&& y >= this[m].coordinates.y && y <= this[m].coordinates.y + this[m].coordinates.h
					) {
						Events.fire('event.clickbutton', this[m]);
						Events.off('event.clickbutton', this[m]);
					}
				}
			});
		},

		drawPlayer: function (player) {
			GUI.draw(player);
		},

		drawTree: function (cellX, cellY) {
			GUI.draw({
				x: Level.Grid.getObjectDisplayXFromCell(cellX, GUI.canvas.width, data.resources['tree'].w),
				y: Level.Grid.getObjectDisplayYFromCell(cellY, GUI.canvas.height, data.resources['tree'].h),
				resource: data.resources.tree
			});
		},

		drawDeath: function (death) {
			if (death.seesPlayer) {
				GUI.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
			}
			else {
				GUI.ctx.fillStyle = 'rgba(0, 150, 0, 0.5)';
			}
			GUI.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
			GUI.ctx.beginPath();
			GUI.ctx.moveTo(
				death.cellChange.x,
				death.cellChange.y
			);
			GUI.ctx.arc(
				death.cellChange.x,
				death.cellChange.y,
				death.visionDepth,
				death.direction.vAngleStart,
				death.direction.vAngleEnd
			);
			GUI.ctx.lineTo(
				death.cellChange.x,
				death.cellChange.y
			);
			GUI.ctx.fill();
			GUI.ctx.stroke();
			GUI.ctx.closePath();

			GUI.draw(death);
		},

		drawLevel: function (level) {
			var d = 0;

			level.grid.loopThroughMap({
				'P': function (col, row) {
					GUI.drawPlayer(level.player);
				},
				'T': function (col, row) {
					GUI.drawTree(row, col);
				},
				'D': function (col, row) {
					GUI.drawDeath(level.deaths[d]);
					++d;
				}
			});
		},

		drawBackground: function (bgResource) {
			var img = data.resources[bgResource].resource,
				pattern = GUI.ctx.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
			GUI.ctx.fillStyle = pattern;
			GUI.ctx.fillRect(0, 0, GUI.canvas.width, GUI.canvas.height); // context.fillRect(x, y, width, height);
		},

		draw: function (object) {
			var resource = object.resource;
			var spriteStartX = object.moveFrame ? parseInt(object.moveFrame) * resource.w : 0,
				spriteStartY = object.direction ? object.direction.spriteRow * resource.h : 0;

			GUI.ctx.drawImage(
				resource.resource,
				// Start in the sprite board
				spriteStartX, spriteStartY,
				// Dimensions in the sprite board
				resource.w, resource.h,
				// Position in the canvas
				object.x, object.y,
				// Dimensions in the canvas
				resource.w, resource.h
			);
		}
	};

	if (typeof (exports) != 'undefined') {
		exports.GUI = GUI;
	}

	return GUI;
});
