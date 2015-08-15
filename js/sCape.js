var sCape = (function () {
	var modules = {},
	_sCape = {};

	_sCape.addModule = function () {
		var args = arguments,
			definition = args.pop(),
			definitionName = args.shift(),
			a;

		if (definitionName in modules) {
			throw 'The module ' + definitionName + ' already exists';
		}

		for (a = 0; a < args; a++) {
			args[a] = modules[a];
		}

		modules[definitionName] = definition.apply({}, args);
	};

	return _sCape;
})();

Object.prototype.extends = function (parent) {
	for (var i in parent) {
		if (parent.hasOwnProperty(i)) {
			this[i] = parent[i];
		}
	}
};
