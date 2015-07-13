(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the GUI module";
	}

	sCape.GUI = {
		init: function (canvasElement) {
			sCape.GUI.canvas = canvasElement;
			sCape.GUI.ctx = sCape.GUI.canvas.getContext('2d');
		}
	};

})(sCape);

