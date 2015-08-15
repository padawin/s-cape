sCape.addModule('Menus', function () {
	return {
		mainmenu: [
			{text: 'New game', event: function () {
				sCape.Engine.initLevel(0);
				sCape.Engine.loadResources(function () {
					sCape.Engine.startMainLoop();
				});
			}}
		]
	};
});


