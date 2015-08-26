var sCape = (function () {
	var modules = {},
		_sCape = {};

	function _loadModule () {
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
			else if (arguments[a] in modules) {
				args.push(modules[arguments[a]]);
			}
			else {
				throw 'Unknown module ' + arguments[a] + ' included by ' + definitionName;
			}
		}

		return [definition, args, definitionName];
	}

	_sCape.executeModule = function () {
		var module = _loadModule.apply(this, arguments);
		module[0].apply({}, module[1]);
	}

	_sCape.addModule = function () {
		var module = _loadModule.apply(this, arguments);
		modules[module[2]] = module[0].apply({}, module[1]);
	};

	return _sCape;
})();

if (typeof (exports) != 'undefined') {
	exports.sCape = sCape;
}

Object.prototype.extends = function (parent) {
	for (var i in parent) {
		if (parent.hasOwnProperty(i)) {
			this[i] = parent[i];
		}
	}
};
