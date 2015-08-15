var sCape = (function () {
	var modules = {},
	_sCape = {};

	_sCape.addModule = function () {
		var args = [],
			definition,
			definitionName,
			a;

		if (arguments.length < 2) {
			throw 'Arguments missing';
		}

		for (a = 0; a < arguments.length; a++) {
			if (a === 0) {
				definitionName = arguments[a];

				if (definitionName in modules) {
					throw 'The module ' + definitionName + ' already exists';
				}
			}
			else if (a == arguments.length - 1) {
				definition = arguments[a];
			}
			else {
				args.push(modules[a]);
			}
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
