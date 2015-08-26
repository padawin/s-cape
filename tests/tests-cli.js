/* global require, process */
var tests = require('./tests.js').Tests;
require('./tests-of-tests.js');
require('../js/sCape.js');
require('../js/Geometry.js');
require('./Geometry.js');

process.exit(tests.runTests(console.log));
