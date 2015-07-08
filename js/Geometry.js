(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Entities module";
	}

	sCape.Geometry = {
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
		}
	};

})(sCape);
