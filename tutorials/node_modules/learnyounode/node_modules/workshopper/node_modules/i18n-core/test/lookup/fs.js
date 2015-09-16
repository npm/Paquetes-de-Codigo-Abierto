"use strict";
var code = require('code'),
	lab = exports.lab = require('lab').script(),
	test = lab.test,
	fs = require("../../lookup/fs"),
	expect = code.expect;

test("custom strategy", function (done) {
	var strategy = {},
		lookup = fs("", strategy);

	expect(lookup.strategy).to.equal(strategy);
	done();
});

test("undefined subkey", function (done) {
	var strategy = {},
		lookup = fs("");

	expect(lookup.get("en")).to.equal(undefined);
	done();
});

test("same file more than once", function (done) {
	var strategy = {},
		lookup = fs(__dirname);

	expect(lookup.get("en.b")).to.equal("c");
	expect(lookup.get("en.d")).to.equal("e");
	done();
});

test("empty file", function (done) {
	var strategy = {},
		lookup = fs(__dirname);

	expect(lookup.get("ja.d")).to.equal(undefined);
	done();
});

test("load strategy returns null", function (done) {
	var strategy = require("../../lookup/folder/json"),
		lookup = fs(__dirname, strategy);
	strategy.load = function () { return null; };

	expect(lookup.get("en.d")).to.equal(undefined);
	done();
});

lab.experiment("fs errors", function () {
	var mockery = require("mockery"),
		existsMock = {
			existsSync: function () {
				throw new Error("fun!");
			}
		},
		allowables = ['../../lookup/fs', './folder/json.js'],
		readMock = {
			existsSync: function () { return true; },
			readFileSync: function () {
				throw new Error("fax");
			}
		};

	lab.before(function (done) {
		mockery.enable();
		mockery.registerAllowables(allowables);
		done();
	});

	test("fs exists error", function (done) {
		mockery.registerMock("fs", existsMock);
		var lookup = require("../../lookup/fs")(__dirname);
		expect(lookup.get("en")).to.equal(undefined);
		done();
	});

	test("fs readFile error", function (done) {
		mockery.registerMock("fs", readMock);
		var lookup = require("../../lookup/fs")(__dirname);
		expect(lookup.get("en")).to.equal(undefined);
		done();
	});

	lab.afterEach(function (done) {
		mockery.deregisterMock("fs");
		done();
	});

	lab.after(function (done) {
		mockery.disable();
		mockery.deregisterAllowables(allowables);
		done();
	});
})