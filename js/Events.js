(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Events module";
	}

	var mouseIsDown = false;

	function _touchEvent (e) {
		_startMotion(e.touches[0].clientX, e.touches[0].clientY);
		e.preventDefault();
		return false;
	}

	function _clickEvent (e) {
		if (!mouseIsDown) {
			return false;
		}

		_startMotion(e.clientX, e.clientY);
	}

	function _startMotion (x, y) {
		var trigoX, trigoY, touchRatio, canvasRatio;
			trigoX = x - sCape.Level.currentLevel.player.cellChange.x;
			trigoY = -1 * y + sCape.Level.currentLevel.player.cellChange.y;

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

	function _stopEvent () {
		if (sCape.Level.currentLevel.player.isMoving()) {
			_worldChanged = true;
			sCape.Level.currentLevel.player.stopMotion();
		}
	}

	sCape.Events = {
		init: function () {
			if (_isMobile) {
				B.addEvent(sCape.GUI.canvas, 'touchstart', _touchEvent);

				B.addEvent(sCape.GUI.canvas, 'touchmove', _touchEvent);

				B.addEvent(sCape.GUI.canvas, 'touchend', _stopEvent);
			}
			else {
				B.addEvent(document, 'mouseup', function (e) {
					_stopEvent(e);
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

	var events = {};

	sCape.EventsManager = {
		on: function(event, callback) {
			if (!(event in events)) {
				events[event] = [];
			}

			events[event].push(callback);
		},

		off: function (event, callback) {
			if (!(event in events)) {
				return false;
			}

			var e = 0;
			while (e < events[event].length) {
				if (callback == events[event][e]) {
					events[event].splice(e, 1);
				}
				else {
					e++;
				}
			}
		},

		fire: function (event) {
			if (event in events) {
				for (var e = 0; e < events[event].length; e++) {
					events[event][e]();
				}
			}
		}
	};

})(sCape);

