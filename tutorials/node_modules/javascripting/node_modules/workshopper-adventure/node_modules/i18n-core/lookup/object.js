"use strict";

var makeFlat = require("../lib/makeFlat");

module.exports = function (object) {
	var flat = makeFlat(object, {});

	return {
		get: function lookup(key) {
			return flat[key];
		}
	};
};