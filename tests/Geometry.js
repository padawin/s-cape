if (typeof (require) != 'undefined') {
	var sCape = require('./../js/sCape.js').sCape;
}

sCape.addModule('GeometryTests', 'Geometry', 'Tests', function (Geometry, Tests) {
	Tests.addSuite('geometry', [
		/**
		 * Test of the method Tests.Point exists
		 */
		function() {
			Tests.isA(Geometry.Point, 'function');
		},

		/**
		 * Test of the method Tests.Rectangle exists
		 */
		function() {
			Tests.isA(Geometry.Rectangle, 'function');
		},

		/**
		 * Test of the method Tests.Segment exists
		 */
		function() {
			Tests.isA(Geometry.Segment, 'function');
		}
	]);
});


