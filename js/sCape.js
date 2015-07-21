var sCape = {};

Object.prototype.extends = function (parent) {
	for (var i in parent) {
		if (parent.hasOwnProperty(i)) {
			this[i] = parent[i];
		}
	}
};
