if (typeof (require) != 'undefined') {
	var sCape = require('./../js/sCape.js').sCape;
}

sCape.executeModule('GeometryTests', 'Geometry', 'Tests', function (Geometry, Tests) {
	Tests.addSuite('geometry', [
		/**
		 * Test if the method Tests.Point exists
		 */
		function() {
			Tests.isA(Geometry.Point, 'function');
		},
		/**
		 * Test of the method Tests.Point
		 */
		function() {
			var p = new Geometry.Point(2, 3);
			Tests.equals(p.x, 2);
			Tests.equals(p.y, 3);

			p = new Geometry.Point(2);
			Tests.equals(p.x, 2);
			Tests.equals(p.y, undefined);

			p = new Geometry.Point();
			Tests.equals(p.x, undefined);
			Tests.equals(p.y, undefined);
		},

		/**
		 * Test if the method Tests.Rectangle exists
		 */
		function() {
			Tests.isA(Geometry.Rectangle, 'function');
		},

		/**
		 * Test of the method Tests.Rectangle
		 */
		function() {
			var r = new Geometry.Rectangle(1, 2, 3, 4);
			Tests.equals(r.x, 1);
			Tests.equals(r.y, 2);
			Tests.equals(r.w, 3);
			Tests.equals(r.h, 4);

			r = new Geometry.Rectangle(1, 2, 3);
			Tests.equals(r.x, 1);
			Tests.equals(r.y, 2);
			Tests.equals(r.w, 3);
			Tests.equals(r.h, undefined);

			r = new Geometry.Rectangle(1, 2);
			Tests.equals(r.x, 1);
			Tests.equals(r.y, 2);
			Tests.equals(r.w, undefined);
			Tests.equals(r.h, undefined);

			r = new Geometry.Rectangle(1);
			Tests.equals(r.x, 1);
			Tests.equals(r.y, undefined);
			Tests.equals(r.w, undefined);
			Tests.equals(r.h, undefined);

			r = new Geometry.Rectangle();
			Tests.equals(r.x, undefined);
			Tests.equals(r.y, undefined);
			Tests.equals(r.w, undefined);
			Tests.equals(r.h, undefined);
		},

		/**
		 * Test if the method Tests.Segment exists
		 */
		function() {
			Tests.isA(Geometry.Segment, 'function');
		},

		/**
		 * Test of the method Tests.Segment
		 */
		function() {
			var s = new Geometry.Segment(new Geometry.Point(1, 2), new Geometry.Point(3, 4));
			Tests.equals(s.p1.x, 1);
			Tests.equals(s.p1.y, 2);
			Tests.equals(s.p2.x, 3);
			Tests.equals(s.p2.y, 4);

			s = new Geometry.Segment(new Geometry.Point(1, 2), new Geometry.Point(3));
			Tests.equals(s.p1.x, 1);
			Tests.equals(s.p1.y, 2);
			Tests.equals(s.p2.x, 3);
			Tests.equals(s.p2.y, undefined);

			s = new Geometry.Segment(new Geometry.Point(1, 2));
			Tests.equals(s.p1.x, 1);
			Tests.equals(s.p1.y, 2);
			Tests.equals(s.p2, undefined);

			s = new Geometry.Segment(new Geometry.Point(1));
			Tests.equals(s.p1.x, 1);
			Tests.equals(s.p1.y, undefined);
			Tests.equals(s.p2, undefined);

			s = new Geometry.Segment();
			Tests.equals(s.p1, undefined);
			Tests.equals(s.p2, undefined);
		}
	]);
});


