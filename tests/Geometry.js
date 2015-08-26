if (typeof (require) != 'undefined') {
	var sCape = require('./../js/sCape.js').sCape;
}

sCape.addModule('GeometryTests', 'Geometry', 'Tests', function (Geometry, Tests) {
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
		},

		/**
		 * Test if the method Tests.Rectangle exists
		 */
		function() {
			Tests.isA(Geometry.Rectangle, 'function');
		},

		/**
		 * Test if the method Tests.Segment exists
		 */
		function() {
			Tests.isA(Geometry.Segment, 'function');
		}
	]);
});


