(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Events module";
	}

	var mouseIsDown = false;

	function _touchEvent (e) {
		_startMotion(e.touches[0].clientX, e.touches[0].clientY);
	}

	function _clickEvent (e) {
		if (!mouseIsDown) {
			return false;
		}

		_startMotion(e.clientX, e.clientY);
	}

	function _startMotion (x, y) {
		var trigoX, trigoY, touchRatio, canvasRatio;
			trigoX = x - sCape.GUI.canvas.width / 2;
			trigoY = -1 * y + sCape.GUI.canvas.height / 2;

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

	sCape.Events = {
		init: function () {
			if (_isMobile) {
				B.addEvent(sCape.GUI.canvas, 'touchstart', _touchEvent);

				B.addEvent(sCape.GUI.canvas, 'touchmove', _touchEvent);

				B.addEvent(sCape.GUI.canvas, 'touchend', function (e) {
					sCape.Level.currentLevel.player.stopMotion();
				});
			}
			else {
				B.addEvent(document, 'mouseup', function (e) {
					if (sCape.Level.currentLevel.player.isMoving()) {
						_worldChanged = true;
						sCape.Level.currentLevel.player.stopMotion();
					}
					mouseIsDown = false;
				});

				B.addEvent(document, 'mousedown', function (e) {
					mouseIsDown = true;
					_clickEvent(e);
				});
				B.addEvent(document, 'mousemove', _clickEvent);
			}
		}
	};

})(sCape);

