(function () {
	var _ctx, _canvas, chase = {};

	function _drawBackground () {
		var img = new Image();

		img.src = 'resources/bg-grass.png';
		img.onload = function(){
			// create pattern
			var pattern = _ctx.createPattern(this, 'repeat'); // Create a pattern with this image, and set it to "repeat".
			_ctx.fillStyle = pattern;
			_ctx.fillRect(0, 0, _canvas.width, _canvas.height); // context.fillRect(x, y, width, height);
		}
	}

	chase.start = function (canvas) {
		_ctx, _currentLevel = 0;

		_canvas =  B.$id(canvas);
		_ctx = _canvas.getContext('2d');

		_drawBackground();
	};

	/**
	 * P = Player
	 * R = Rock
	 * T = Tree
	 * H = Home
	 * D = Death
	 */
	chase.levels = [
		[
			['','','','R','','P','','','',''],
			['','','','','','','','','',''],
			['','R','','T','','','','R','',''],
			['','','','','','','','','',''],
			['','D','','','','','','T','',''],
			['','','','','','','','','D',''],
			['','T','R','','T','','','','',''],
			['','','','','','','','','R',''],
			['','','','','','','T','','',''],
			['','','','','','','','','','H']
		]

	];

	window.chase = chase;
})();
