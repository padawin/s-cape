(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Events module";
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
		},

		initMenu: function (menu) {
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
	};

	var events = {};

	sCape.EventsManager = {
		on: function(event, element, callback) {
			if (!(event in events)) {
				events[event] = [];
			}

			events[event].push([element, callback]);
		},

		off: function () {
			var event = null,
				element = null,
				callback = null,
				e = 0;
			// completely unplug all the events
			if (arguments.length == 0) {
				events = {};
				return;
			}

			event = arguments[0];
			if (!(event in events)) {
				return;
			}

			// completely unplug the event
			if (arguments.length == 1) {
				events[event] = [];
				return;
			}
			// unplug all the events of the given element
			else if (arguments.length == 2) {
				element = arguments[1];
			}
			// unplug the given event/callback for the given element
			else if (arguments.length == 3) {
				element = arguments[1];
				callback = arguments[2];
			}

			var e = 0;
			while (e < events[event].length) {
				if (element == events[event][e][0]
					&& (!callback || callback && callback == events[event][e][1])
				) {
					events[event].splice(e, 1);
				}
				else {
					e++;
				}
			}
		},

		fire: function (event, args) {
			if (event in events) {
				for (var e = 0; e < events[event].length; e++) {
					events[event][e][1].apply(events[event][e][0], args);
				}
			}
		}
	};

})(sCape);

