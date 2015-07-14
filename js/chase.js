(function () {
	var chase = {};

	chase.start = function (canvas, isMobile) {
		_isMobile = isMobile;

		sCape.GUI.init(B.$id(canvas));

		sCape.Engine.initLevel(0);
		sCape.Engine.loadResources(function () {
			sCape.Events.init();
			sCape.Engine.startMainLoop();
		});
	};

	window.chase = chase;
})();
