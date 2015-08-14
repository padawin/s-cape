(function () {
	var chase = {};

	chase.start = function (canvas, width, height, isMobile) {
		_isMobile = isMobile;

		sCape.GUI.init(B.$id(canvas), width, height);
		sCape.Events.init();
		sCape.GUI.drawMenu(sCape.Menus.mainmenu);
	};

	window.chase = chase;
})();
