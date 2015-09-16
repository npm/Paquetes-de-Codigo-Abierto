"use strict";

function getStart(namedValues) {
	return (typeof namedValues === "object" && namedValues !== null) ? 2 : 1;
}

function getArgs(startOfArgs, args) {
	return (args.length > startOfArgs) ? Array.prototype.slice.call(args, startOfArgs) : [];
}

module.exports = function createTranslator(prefix, parent, allowModification) {
	var ns;
	if (parent) {
		ns = function () {
			return parent.ns() + prefix;
		};
	} else {
		ns = function () {
			return prefix;
		};
	}

	function has(key) {
		return parent.has(prefix, key);
	}

	function raw(key) {
		return parent.raw(prefix, key);
	}

	function __(key, namedValues) {
		var startOfArgs = getStart(namedValues),
			args = getArgs(startOfArgs, arguments);
		return this.translate(ns(), [key], key, startOfArgs == 2 ? namedValues : null, args);
	}

	function __n(singular, plural, count, namedValues) {
		var startOfArgs = getStart(namedValues) + 2,
			args,
			keys,
			fallbackKey;

		if (typeof plural !== "object" &&
			typeof plural !== "string") {
			namedValues = count;
			count = plural;
			plural = typeof singular === "object" ? singular : null;
			startOfArgs -= 1;
		}
		if (typeof plural === "object") {
			if (plural !== null) {
				plural = plural[count] ||
						 plural.other ||
						 plural.one;
			}
			plural = plural ||
			        (typeof singular === "object" ? 
			        	(singular[count] ||
			        	 singular.other ||
			        	 singular.one)
			        	: null);
		}
		if (typeof singular === "object") {
			singular = singular[count] ||
			           singular.one;
		}
		args = getArgs(startOfArgs, arguments);
		if (!namedValues || startOfArgs === 3) {
			namedValues = {};
		}
		namedValues.count = count;
		args.unshift(count);
		if (count > 1) {
			keys = [singular + "." + count, singular + ".other", singular, singular + ".one"];
			if (plural) {
				keys.unshift(plural)
			}
			fallbackKey = plural || singular;
		} else {
			keys = [singular + ".one", singular];
			fallbackKey = singular;
		}
		return this.translate(ns(), keys, fallbackKey, namedValues, args);
	}

	function lang(locale, allowSubModification) {
		return this.sub(locale + ".", allowSubModification);
	}

	function translate(prefix, keys, fallbackKey, namedValues, args) {
		return parent.translate(prefix, keys, fallbackKey, namedValues, args);
	}

	function sub(prefix, allowSubModification) {
		if (prefix === null || prefix === undefined) {
			throw new Error("Prefix is not allowed to be null or undefined");	
		}
		var translator = this.storage[prefix];
		if (!translator) {
			translator = createTranslator(prefix, this, allowSubModification);
			this.storage[prefix] = translator;
		}
		return translator;
	}

	var result = {
		storage: {}
	};
	result.translate = translate.bind(result);
	result.lang = lang.bind(result);
	result.sub = sub.bind(result);
	result.ns = ns;
	result.has = has.bind(result);
	result.raw = raw.bind(result);
	result.__ = __.bind(result);
	result.__n = __n.bind(result);

	if (allowModification) {
		result.changePrefix = function changePrefix(newPrefix) {
			prefix = newPrefix;
		};
	} else {
		result.changePrefix = function changePrefix() {
			throw new Error("Forbidden by configuration");
		};
	}

	result.changeLang = function changeLang(lang) {
		result.changePrefix(lang + ".");
	};
	return result;
};