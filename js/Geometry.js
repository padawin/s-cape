sCape.addModule('Geometry', function () {
	return {
		Point: function (x, y) {
			this.x = x;
			this.y = y;
		},

		Rectangle: function (x, y, w, h) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		},

		Segment: function (p1, p2) {
			this.p1 = p1;
			this.p2 = p2;
		},

		ANGLE_TOP_RIGHT: 7 * Math.PI / 4,
		ANGLE_TOP_LEFT: 5 * Math.PI / 4,
		ANGLE_BOTTOM_LEFT: 3 * Math.PI / 4,
		ANGLE_BOTTOM_RIGHT: Math.PI / 4
	};
});
