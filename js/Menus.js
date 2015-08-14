(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Menu module";
	}

	sCape.Menus = {
		mainmenu: [
			{text: 'New game', event: function () {
				sCape.Engine.initLevel(0);
				sCape.Engine.loadResources(function () {
					sCape.Engine.startMainLoop();
				});
			}}
		]
	};
})(sCape);


