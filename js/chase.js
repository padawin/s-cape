sCape.addModule('Main', 'GUI', 'Events', 'Menus', function (GUI, Events, Menus) {
	var chase = {};

	chase.start = function (canvas, width, height, isMobile) {
		_isMobile = isMobile;

		GUI.init(B.$id(canvas), width, height);
		Events.init(B.$id(canvas));
		GUI.drawMenu(Menus.mainmenu);
	};

	window.chase = chase;
});
