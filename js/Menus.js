sCape.addModule('Menus', 'Engine', function (Engine) {
	return {
		mainmenu: [
			{text: 'New game', event: function () {
				Engine.initLevel(0);
				Engine.loadResources(function () {
					Engine.startMainLoop();
				});
			}}
		]
	};
});


