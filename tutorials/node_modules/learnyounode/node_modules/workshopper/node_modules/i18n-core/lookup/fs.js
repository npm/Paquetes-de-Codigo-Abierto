"use strict";

var path = require("path"),
    makeFlat = require("../lib/makeFlat");

module.exports = function (folder, strategy) {
	// need to load here, because it needs a mock for testing.
	var fs = require("fs"), 
		getRaw = function getRaw(file) {
			try {
				return fs.readFileSync(file, "utf8");	
			} catch (e) {}
			return null;
		},
		exists = function exists(file) {
			var exists = false;
			try {
				exists = fs.existsSync(file);
			} catch(e) {}
			return exists;
		};
	if (!strategy) {
		strategy = require("./folder/json.js");
	}

	return Object.create({
		cache: {},
		folder: folder,
		strategy: strategy,
		get: function get(key) {
			var keyParts = /^([^\.]*)(\.(.*))?$/.exec(key),
			    prefix = keyParts[1],
				property = keyParts[3] || "",
				file = this.strategy.getFile(path.resolve(this.folder, prefix)),
				keyStorage = this.cache[file],
				raw;

			if (!keyStorage) {
				keyStorage = {
					data: {},
					file: file
				};
				if (exists(file)) {
					raw = getRaw(file);
					if (raw) {
						try {
							keyStorage.data = makeFlat(this.strategy.load(raw) || {}, {});	
						} catch(e) {}
					}
				}
				keyStorage.time = Date.now();
				this.cache[file] = keyStorage;
			}
			return keyStorage.data[property];
		}
	});

};
