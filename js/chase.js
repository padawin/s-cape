(function () {
	var chase = {};

	function _drawBackground(canvas, ctx) {
		var img = new Image();

		img.src = 'resources/bg-grass.png';
		img.onload = function(){
			// create pattern
			console.log(ctx.width, ctx.height);
			var pattern = ctx.createPattern(this, 'repeat'); // Create a pattern with this image, and set it to "repeat".
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);
		}
	}

	chase.start = function (canvas) {
		var ctx;

		canvas =  B.$id(canvas);
		ctx = canvas.getContext('2d');

		_drawBackground(canvas, ctx);
	};

	window.chase = chase;
})();
