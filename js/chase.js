(function () {
	var chase = {};

	chase.start = function (canvas, width, height, isMobile) {
		_isMobile = isMobile;

		sCape.GUI.init(B.$id(canvas), width, height);

		sCape.Engine.initLevel(0);
		sCape.Engine.loadResources(function () {
			sCape.Events.init();
			sCape.Engine.startMainLoop();
		});
	};

	window.chase = chase;
})();
