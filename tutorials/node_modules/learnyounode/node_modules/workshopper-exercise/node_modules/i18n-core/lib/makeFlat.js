"use strict";

function makeFlat(object, target, prefix) {
	if (!prefix) {
		prefix = "";
	}
	Object.keys(object).forEach(function (key) {
		var val = object[key];
		if (typeof val === "object" && val !== null) {
			makeFlat(val, target, prefix + key + ".");
		}
		target[prefix + key] = val;
	});
	return target;
}

module.exports = makeFlat;