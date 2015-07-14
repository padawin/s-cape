(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Events module";
	}

	sCape.Events = {
		init: function () {
			if (_isMobile) {
				function _touchEvent (e) {
					var trigoX, trigoY, touchRatio, canvasRatio;
					trigoX = e.touches[0].clientX - sCape.GUI.canvas.width / 2;
					trigoY = -1 * e.touches[0].clientY + sCape.GUI.canvas.height / 2;
					touchRatio = Math.abs(trigoY / trigoX);
					canvasRatio = sCape.GUI.canvas.height / sCape.GUI.canvas.width;
					if (trigoY > 0 && touchRatio > canvasRatio) {
						sCape.Engine.startPlayerMotion('up');
					}
					else if (trigoY < 0 && touchRatio > canvasRatio) {
						sCape.Engine.startPlayerMotion('down');
					}
					else if (trigoX > 0) {
						sCape.Engine.startPlayerMotion('right');
					}
					else {
						sCape.Engine.startPlayerMotion('left');
					}
				}

				B.addEvent(sCape.GUI.canvas, 'touchstart', _touchEvent);

				B.addEvent(sCape.GUI.canvas, 'touchmove', _touchEvent);

				B.addEvent(sCape.GUI.canvas, 'touchend', function (e) {
					sCape.Engine.player.stopMotion();
				});
			}
			else {
				B.addEvent(document, 'keyup', function (e) {
					if (sCape.Engine.player.isMoving()) {
						_worldChanged = true;
						sCape.Engine.player.stopMotion();
					}
				});

				B.addEvent(document, 'keydown', function (e) {
					switch (e.which) {
						case 37: // left
							sCape.Engine.startPlayerMotion('left');
							e.preventDefault();
							break;
						case 38: // up
							sCape.Engine.startPlayerMotion('up');
							e.preventDefault();
							break;
						case 39: // right
							sCape.Engine.startPlayerMotion('right');
							e.preventDefault();
							break;
						case 40: // down
							sCape.Engine.startPlayerMotion('down');
							e.preventDefault();
							break;
					};
				});
			}
		}
	};

})(sCape);

