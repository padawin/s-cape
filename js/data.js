if (typeof (require) != 'undefined') {
	var sCape = require('./sCape.js').sCape;
}

sCape.addModule('data', function () {
	var data = {
		'resources': {
			// url, tile dimensions, top left position in grid's cell to be
			// middle bottom aligned
			'grass': {'url': 'resources/bg-grass.png', 'w': 40, 'h': 40},
			'tree': {'url': 'resources/tree.png', 'w': 48, 'h': 48, 'hitbox': [12, 36, 24, 12]},
			'player': {'url': 'resources/player.png', 'w': 32, 'h': 48, 'cellChange': [16, 36], 'hitbox': [8, 24, 16, 24]},
			'death': {'url': 'resources/death.png', 'w': 50, 'h': 48, 'cellChange': [25, 36], 'hitbox': [12, 24, 24, 24]}
		},
		'nbResources': 4,
		'levels': [
			{
				'tileWidth': 48,
				'tileHeight': 24,
				/**
				 * P = Player
				 * R = Rock
				 * T = Tree
				 * H = Home
				 * D = Death
				 */
				'map': [
					['','','','','','','','','',''],
					['','','','','','P','','','',''],
					['','','','T','','','','','',''],
					['','','','','','','','','',''],
					['','D','','','','','','T','',''],
					['','','','','','','','','',''],
					['','T','','D','T','','','','',''],
					['','','','','','','','','',''],
					['','','','','','','T','D','',''],
					['','','','','','','','','',''],
					['','','','','','','','','',''],
					['','','','T','','','','','',''],
					['','','','','','','','','',''],
					['','','D','','','','','T','',''],
					['','','','','','','','','',''],
					['','T','','','T','','','','',''],
					['','','','','','','','D','',''],
					['','','','','','','T','','',''],
					['','','','','','','','','','H']
				]
			}
		]
	};

	if (typeof (exports) != 'undefined') {
		exports.data = data;
	}

	return data;
});
