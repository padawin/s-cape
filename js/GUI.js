(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the GUI module";
	}

	function _drawButton(ctx, y, button) {
		sCape.GUI.ctx.fillStyle = '#E0995E';

		ctx.font = "30px Arial";
		var textSize = ctx.measureText(button.text);
		// Button border
		sCape.GUI.ctx.fillRect((sCape.GUI.canvas.width - textSize.width) / 2 - 5, y, textSize.width + 10, 40);
		// Button background
		sCape.GUI.ctx.strokeRect((sCape.GUI.canvas.width - textSize.width) / 2 - 5, y, textSize.width + 10, 40);
		sCape.GUI.ctx.fillStyle = '#000';
		// Button text
		sCape.GUI.ctx.fillText(button.text, (sCape.GUI.canvas.width - textSize.width) / 2, y + 30);

		return {
			x: (sCape.GUI.canvas.width - textSize.width) / 2,
			y: y,
			w: textSize.width + 10,
			h: 40
		};
	}

	sCape.GUI = {

		init: function (canvasElement, width, height) {
			sCape.GUI.canvas = canvasElement;
			sCape.GUI.canvas.width = width;
			sCape.GUI.canvas.height = height;
			sCape.GUI.ctx = sCape.GUI.canvas.getContext('2d');
		},

		drawMenu: function (menu) {
			// draw background
			sCape.GUI.ctx.fillStyle = '#734B4B';
			sCape.GUI.ctx.fillRect(0, 0, sCape.GUI.canvas.width, sCape.GUI.canvas.height); // context.fillRect(x, y, width, height);

			var y = 100;
			for (var i = 0; i < menu.length; i++) {
				menu[i].coordinates = _drawButton(sCape.GUI.ctx, y, menu[i]);
				sCape.Events.on('event.clickbutton', menu[i], menu[i].event);
				y = menu[i].coordinates.h + menu[i].coordinates.y + 20;
			}

			sCape.Events.on('event.action-on-screen', menu, function (x, y) {
				for (var m = 0; m < this.length; m++) {
					if (x >= this[m].coordinates.x && x <= this[m].coordinates.x + this[m].coordinates.w
						&& y >= this[m].coordinates.y && y <= this[m].coordinates.y + this[m].coordinates.h
					) {
						sCape.Events.fire('event.clickbutton', this[m]);
						sCape.Events.off('event.clickbutton', this[m]);
					}
				}
			});
		},

		drawPlayer: function (player) {
			sCape.GUI.draw(player);
		},

		drawTree: function (cellX, cellY) {
			sCape.GUI.draw({
				x: sCape.Level.Grid.getObjectDisplayXFromCell(cellX, sCape.data.resources['tree'].w),
				y: sCape.Level.Grid.getObjectDisplayYFromCell(cellY, sCape.data.resources['tree'].h),
				resource: sCape.data.resources.tree
			});
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

			sCape.GUI.draw(death);
		},

		drawLevel: function (level) {
			var d = 0;

			level.grid.loopThroughMap({
				'P': function (col, row) {
					sCape.GUI.drawPlayer(level.player);
				},
				'T': function (col, row) {
					sCape.GUI.drawTree(row, col);
				},
				'D': function (col, row) {
					sCape.GUI.drawDeath(level.deaths[d]);
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

		draw: function (object) {
			var resource = object.resource;
			var spriteStartX = object.moveFrame ? parseInt(object.moveFrame) * resource.w : 0,
				spriteStartY = object.direction ? object.direction.spriteRow * resource.h : 0;

			sCape.GUI.ctx.drawImage(
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
})(sCape);

