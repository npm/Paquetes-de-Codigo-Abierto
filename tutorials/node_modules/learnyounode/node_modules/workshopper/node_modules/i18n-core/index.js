"use strict";

function defaultFallback(key) {
	if (!key) {
		return "(?)";
	}
	return key;
}

function getLookup(data) {
	if (data && data.get) {
		// Direct lookup implementation pass-through
		return data;
	} else if (typeof data === "string") {
		return require("./lookup/fs")(data);
	}
	return require("./lookup/object")(data || {});
}

function getKey(prefix, key) {
	return (key !== null && key !== undefined) ? prefix + key : prefix;
}

function defaultTranslation(prefix, keys, fallbackKey, namedValues, args) {
	var result,
		keyNo = 0;
	while (!result && keyNo < keys.length) {
		result = this.raw(prefix, keys[keyNo]);
		keyNo += 1;
	}
	if (result === null || result === undefined) {
		result = this.fallback(getKey(prefix, fallbackKey));
	}
	if (namedValues && (/{{.*}}/).test(result)) {
		result = this.mustache.render(result, namedValues);
	}
	if (args.length > 0 && /%/.test(result)) {
		return this.vsprintf(result, args);
	}
	return result;
}

function has(prefix, key) {
	var val = this.raw(prefix, key);
	return val !== undefined && val !== null;
}

function raw(prefix, key) {
	return this.lookup.get(getKey(prefix, key));
}

module.exports = function (data, allowModification) {
	var translator = require("./lib/createTranslator")("", null, allowModification);
	translator.lookup = getLookup(data);
	translator.fallback = defaultFallback;
	translator.has = has;
	translator.raw = raw;
	translator.mustache = require("mustache");
	translator.vsprintf = require("sprintf").vsprintf;
	translator.translate = defaultTranslation;
	return translator;
}