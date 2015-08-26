/* global require, process */
var tests = require('./tests.js').Tests;
require('./tests-of-tests.js');
require('../js/sCape.js');
require('../js/Geometry.js');
require('../js/data.js');
require('../js/Events.js');
require('../js/Level.js');
require('../js/GUI.js');
require('../js/Physics.js');
require('../js/Entities.js');
require('../js/PathFinding.js');
require('../js/Engine.js');
require('./Geometry.js');

process.exit(tests.runTests(console.log));
