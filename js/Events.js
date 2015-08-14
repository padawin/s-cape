(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Events module";
	}

	function _stopEvent () {
		sCape.EventsManager.fire('event.action-off-screen');
	}

	sCape.Events = {
		init: function (canvas) {
			var mouseIsDown = false;

			function _touchEvent (e) {
				sCape.EventsManager.fire('event.action-on-screen', [e.touches[0].clientX, e.touches[0].clientY]);
				e.preventDefault();
				return false;
			}

			function _clickEvent (e) {
				if (!mouseIsDown) {
					return false;
				}

				sCape.EventsManager.fire('event.action-on-screen', [e.clientX, e.clientY]);
			}

			if (_isMobile) {
				B.addEvent(canvas, 'touchstart', _touchEvent);

				B.addEvent(canvas, 'touchmove', _touchEvent);

				B.addEvent(canvas, 'touchend', _stopEvent);
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

