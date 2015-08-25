/* global require, process */
var tests = require('./tests.js').Tests;
require('./tests-of-tests.js');

process.exit(tests.runTests(console.log));
