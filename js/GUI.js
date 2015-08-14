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

	function _initMenu (menu) {
		function _touchEvent (e) {
			_clickScreen(true, e.touches[0].clientX, e.touches[0].clientY);
			e.preventDefault();
			return false;
		}

		function _clickEvent (e) {
			_clickScreen(false, e.clientX, e.clientY);
		}

		function _clickScreen (isMobile, x, y) {
			for (var m = 0; m < menu.length; m++) {
				if (x >= menu[m].coordinates.x && x <= menu[m].coordinates.x + menu[m].coordinates.w
					&& y >= menu[m].coordinates.y && y <= menu[m].coordinates.y + menu[m].coordinates.h
				) {
					sCape.EventsManager.fire('event.clickbutton', menu[m]);
					if (_isMobile) {
						B.removeEvent(sCape.GUI.canvas, 'touch', _touchEvent);
					}
					else {
						B.removeEvent(document, 'click', _clickEvent);
					}
				}
			}
		}

		if (_isMobile) {
			B.addEvent(sCape.GUI.canvas, 'touch', _touchEvent);
		}
		else {
			B.addEvent(document, 'click', _clickEvent);
		}
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
				sCape.EventsManager.on('event.clickbutton', menu[i], menu[i].event);
				y = menu[i].coordinates.h + menu[i].coordinates.y + 20;
			}

			_initMenu(menu);

		},

		drawPlayer: function () {
			sCape.GUI.draw(sCape.Level.currentLevel.player);
		},

		drawTree: function (cellX, cellY) {
			sCape.GUI.draw({
				x: sCape.Grid.getObjectDisplayXFromCell(cellX, sCape.data.resources['tree'].w),
				y: sCape.Grid.getObjectDisplayYFromCell(cellY, sCape.data.resources['tree'].h),
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
					sCape.GUI.drawPlayer();
				},
				'T': function (col, row) {
					sCape.GUI.drawTree(row, col);
				},
				'D': function (col, row) {
					sCape.GUI.drawDeath(sCape.Level.currentLevel.deaths[d]);
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
			// the animations have 4 frames
			// the grid has cells of sCape.Level.currentLevel.grid.tileWidth * sCape.Level.currentLevel.grid.tileHeight px
			// there are 4 directions, so 4 rows in the sprite
			// To set the sprite on the middle bottom of the tile
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

