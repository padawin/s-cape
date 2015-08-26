/* global require, process */
var tests = require('./tests.js').Tests;
require('./tests-of-tests.js');
require('../js/sCape.js');

process.exit(tests.runTests(console.log));
