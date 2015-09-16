"use strict";
var code = require('code'),
	lab = exports.lab = require('lab').script(),
	test = lab.test,
	i18n = require("../"),
	expect = code.expect;

test("basic object lookup", function (done) {
	var translator = i18n({a: "b"})
	expect(translator.__("a")).to.equal("b");
	expect(translator.__("c")).to.equal("c");
	done();
});

test("basic existance object lookup", function (done) {
	var translator = i18n({a: "b", c: null, d: {e: "f", g: null}}),
		d = translator.lang('d');
	expect(translator.has("a")).to.equal(true);
	expect(translator.has("b")).to.equal(false);
	expect(translator.has("c")).to.equal(false);
	expect(translator.has("d")).to.equal(true);
	expect(d.has("e")).to.equal(true);
	expect(d.has("g")).to.equal(false);
	expect(d.has("h")).to.equal(false);
	done();
});

test("raw passthrough lookup", function (done) {
	var translator = i18n({a: "b", c: null, d: {e: "f", g: null}}),
		d = translator.lang('d');
	expect(translator.raw("a")).to.equal("b");
	expect(translator.raw("b")).to.equal(undefined);
	expect(translator.raw("c")).to.equal(null);
	expect(translator.raw("d")).to.deep.equal({
		e: "f",
		g: null
	});
	expect(d.raw("e")).to.equal("f");
	expect(d.raw("g")).to.equal(null);
	expect(d.raw("h")).to.equal(undefined);
	done();
});

test("basic file lookup", function (done) {
	expect(i18n(__dirname + "/lookup").lang("en").__("b")).to.equal("c");
	done();
});

test("missing file lookup", function (done) {
	expect(i18n(__dirname + "/lookup").lang("de").__("b")).to.equal("de.b");
	done();
});

test("custom lookup", function (done) {
	expect(i18n(require("../lookup/object")({"en": {c:"d"}})).lang("en").__("c")).to.equal("d");
	done();
});

test("mustache testing", function (done) {
	expect(i18n({"en": {a: "{{hello}}"}}).lang("en").__("a", {hello: "d"})).to.equal("d");
	done();
});

test("args testing", function (done) {
	expect(i18n({"en": {a: "%s"}}).lang("en").__("a", "e")).to.equal("e");
	done();
});

test("fallback", function (done) {
	var translator = i18n(),
		__  = translator.__;
	expect(__("a")).to.equal("a");
	expect(__("")).to.equal("(?)");
	done();
});

test("custom root fallback", function (done) {
	var translator = i18n();
	translator.fallback = function () {
		return "x";
	};
	translator = translator.lang("en");
	expect(translator.__("a")).to.equal("x");
	expect(translator.__("")).to.equal("x");
	done();
});

test("custom child fallback should not work!", function (done) {
	var translator = i18n().lang("en");
	translator.fallback = function () {
		return "x";
	};
	expect(translator.__("a")).to.equal("en.a");
	done();
});

test("args without placeholder", function (done) {
	expect(i18n({"en": {a: ""}}).lang("en").__("a", "e")).to.equal("");
	done();
});

test("mixed mustache & args testing", function (done) {
	expect(i18n({"en": {a: "%s {{hello}}"}}).lang("en").__("a", {hello: "g"}, "f")).to.equal("f g");
	done();
});

test("changing of the language should be possible after the fact if allowed", function (done) {
	var translator = i18n(__dirname + "/lookup").lang("en", true),
		__ = translator.__;

	expect(__("d")).to.equal("e");
	translator.changeLang("gr");
	expect(__("d")).to.equal("g");
	done();
});

test("changing of the prefix should be possible after the fact if allowed", function (done) {
	var translator = i18n(__dirname + "/lookup").lang("en", true),
		__ = translator.__;

	expect(__("d")).to.equal("e");
	translator.changePrefix("gr.");
	expect(__("d")).to.equal("g");
	done();
});

test("changing of the language should not be possible after the fact", function (done) {
	var translator = i18n(__dirname + "/lookup").lang("en"),
		__ = translator.__;

	expect(__("d")).to.equal("e");
	try {
		translator.changeLang("gr");
	} catch(e) {
		expect(__("d")).to.equal("e");
		done();
		return;
	}
	throw new Error("Translation should be blocked.")
});

test("changing of the prefix should affect the subprefix", function (done) {
	var translator = i18n(__dirname + "/lookup").sub("g", true),
		translator2 = translator.lang("n"),
		__ = translator2.__;

	translator.changePrefix("e");

	expect(__("d")).to.equal("e");
	done();
});

test("plurals", function (done) {
	var translator = i18n().lang("en"),
		__n = translator.__n;
	expect(__n("%s a", "", 1)).to.equal("en.1 a");
	expect(__n("", "%s b", 2)).to.equal("en.2 b");
	expect(__n("%s a {{count}}", "", 1)).to.equal("en.1 a 1");
	expect(__n("", "%s b {{count}}", 2)).to.equal("en.2 b 2");
	expect(__n("", "{{count}} c", 3)).to.equal("en.3 c");
	done();
});

test("plurals mixed with args", function (done) {
	var translator = i18n().lang("en"),
		__n = translator.__n;
	expect(__n("%s a %s", "", 1, "x")).to.equal("en.1 a x");
	expect(__n("", "%s b %s", 2, "y")).to.equal("en.2 b y");
	expect(__n("%s c %s {{a}}", "", 1, {a: "b"}, "x")).to.equal("en.1 c x b");
	expect(__n("", "%s d %s {{c}}", 2, {c: "d"}, "y")).to.equal("en.2 d y d");
	expect(__n("", "%s e {{e}}", 2, {e: "f"})).to.equal("en.2 e f");
	done();
});

test("plural objects", function (done) {
	var translator = i18n().lang("en"),
		__n = translator.__n;
	expect(__n({one: "a", other: "%s"}, 2, "x")).to.equal("en.2");
	expect(__n({1: "b %s"}, 1, "x")).to.equal("en.b 1");
	expect(__n({2: "c %s"}, 2, "x")).to.equal("en.c 2");
	expect(__n({}, {2: "d %s"}, 2, "x")).to.equal("en.d 2");
	expect(__n({}, {other: "e %s"}, 2, "x")).to.equal("en.e 2");
	done();
});

test("undefined fallback", function (done) {
	var translator = i18n({a: null, b: undefined});
	expect(translator.__(null)).to.equal("(?)");
	expect(translator.__(undefined)).to.equal("(?)");
	expect(translator.__("a")).to.equal("a");
	expect(translator.__("b")).to.equal("b");
	done();
});

test("empty key", function (done) {
	var translator = i18n("./lookup");
	expect(translator.__("")).to.equal("(?)");
	done();
});

test("empty key in namespace", function (done) {
	var translator = i18n("./lookup").lang("en");
	expect(translator.__("")).to.equal("en.");
	done();
});

test("undefined key in namespace", function (done) {
	var translator = i18n("./lookup").lang("en");
	expect(translator.__(undefined)).to.equal("en.");
	done();
});

test("null namespace with key", function (done) {
	try {
		var translator = i18n("./lookup").sub(null);
	} catch(e) {
		return done();
	}
	throw new Error("Should not be allowed.");
});

test("undefined namespace with key", function (done) {
	try {
		var translator = i18n("./lookup").sub(undefined);
	} catch(e) {
		return done();
	}
	throw new Error("Should not be allowed.");
});

test("plural fallbacks", function (done) {
	var translator = i18n().lang("en"),
		__n = translator.__n;
	expect(__n("a %s", 2, "x")).to.equal("en.a 2");
	expect(__n({other: "b %s"}, 2, "x")).to.equal("en.b 2");
	expect(__n({one: "c %s"}, 2, "x")).to.equal("en.c 2");
	expect(__n({other: "d %s"}, null, 2, "x")).to.equal("en.d 2");
	expect(__n({2: "e %s"}, null, 2, "x")).to.equal("en.e 2");
	expect(__n({one: "f %s"}, null, 2, "x")).to.equal("en.f 2");
	expect(__n("g %s", null, 2, "x")).to.equal("en.g 2");
	done();
});

test("plural special fallbacks", function (done) {
	var translator = i18n({a: "b", c: {one: "d", other: "e"}}),
		__n = translator.__n;
	expect(__n("a", 2)).to.equal("b");
	expect(__n("c", 2)).to.equal("e");
	expect(__n("g", {other: "f"}, 2)).to.equal("f");
	done();
});

test("sprintf strings to be treated as strings", function (done) {
	var __ = i18n().__;
	expect(__('%s', 1)).to.equal("1");
	expect(__('%s', "01")).to.equal("01");
	expect(__('%s', false)).to.equal("false");
	expect(__('%s', "false")).to.equal("false");
	expect(__('%s', true)).to.equal("true");
	expect(__('%s', "true")).to.equal("true");
	expect(__('%s', null)).to.equal("null");
	expect(__('%s', "null")).to.equal("null");
	expect(__('%s', undefined)).to.equal("undefined");
	expect(__('%s', "undefined")).to.equal("undefined");
	done();
});

test("mustach strings to be treated as strings", function (done) {
	var __ = i18n({"$": "{{data}}"}).__;
	expect(__('$', {data: 1})).to.equal("1");
	expect(__('$', {data: "01"})).to.equal("01");
	expect(__('$', {data: false})).to.equal("false");
	expect(__('$', {data: "false"})).to.equal("false");
	expect(__('$', {data: true})).to.equal("true");
	expect(__('$', {data: "true"})).to.equal("true");
	expect(__('$', {data: null})).to.equal("");
	expect(__('$', {data: "null"})).to.equal("null");
	expect(__('$', {data: undefined})).to.equal("");
	expect(__('$', {data: "undefined"})).to.equal("undefined");
	done();
});

test("same translator", function (done) {
	var set = i18n();
	expect(set.lang("en")).to.equal(set.lang("en"));
	done();
});