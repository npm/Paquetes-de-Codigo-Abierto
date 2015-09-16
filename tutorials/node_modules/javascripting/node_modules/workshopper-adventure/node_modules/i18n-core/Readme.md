# i18n-core

[![Join the chat at https://gitter.im/martinheidegger/i18n-core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/martinheidegger/i18n-core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/martinheidegger/i18n-core.svg)](https://travis-ci.org/martinheidegger/i18n-core)
[![Code Climate](https://codeclimate.com/github/martinheidegger/i18n-core/badges/gpa.svg)](https://codeclimate.com/github/martinheidegger/i18n-core)

[i18n-core](https://github.io/martinheidegger/i18n-core) is a no-fuzz Node.js implementation of i18n. It doesn't connect to express or any other fancy Node framework and is extensible where it needs to be and allows to reduce the complexity of other i18n implementations (thus the name).

It implements basic variable replacements in the mustache and sprintf manner.

# Installation

To use *i18n-core* all you need to do is install it using ```npm```

```bash
$ npm i i18n-core --save
```

# Usage

```JavaScript
var i18n_core = require("i18n-core")
var i18n = i18n_core({greeting: "hello!"})
i18n.__("greeting") // hello!
```

To have different namespaces for different languages you can get a prefixed subpart using `.lang()`.

```JavaScript

var i18n = i18n_core({
  en: { greeting: "hello!" },
  de: { greeting: "guten tag!"}
})

var en = i18n.lang("en")
en.__("greeting") // hello!

var de = i18n.lang("de")
de.__("greeting") // guten tag!
```
*Note: `.lang(<lang>)` is the same thing as `.sub(<lang> + ".")`*

The system is based on `lookup` implementations that allow the system to use different sources to get its strings from. The examples before used an object and because of this the former example would be equal to:

```JavaScript
var i18n = i18n_core(require("i18n-core/lookup/object")({greeting: "hello!"}))
```

If you were to pass in a string to `i18n-core` instead like this:

```JavaScript
var i18n = i18n_core("./")
```

Then it would be equal the primitive file-system lookup same like this:

```JavaScript
var i18n = i18n_core(require("i18n-core/lookup/fs")("./"))
```

You can pass in your own strategy by given an object to the constructor that contains a "get"-method:

```JavaScript
var i18n = i18n_core({
    get: function (key) {
        return null; // Who needs translation anyway?
    }
})
```

*i18n-core* does implement basic placeholder replacements like:

```JavaScript
en.__("%s is cool", "he"); // "he is cool"
```

following the logic of [sprintf](https://github.com/maritz/node-sprintf).

It also offers [mustache](https://github.com/janl/mustache.js) pattern replacement like this:

```JavaScript
en.__("{{name}} are cool too", {name: "you"}); // "you are cool too"
```

It is possible to chain translation prefixes like this:

```JavaScript
var at = i18n_core({de:{at: {hello: "Zewas!"}}}).lang("de").lang("at");
at.__("hello") // Zewas!
```

and you can also change the chain if you want to.

```JavaScript
var translate = i18n_core({
    de: {title: "Meine Webseite"},
    en: {title: "My Website"}
}).lang("de", true) // <- this true is important :)
translate.__("title") // Meine Website
translate.changeLang("en")
translate.__("title") // My Website
```

To prevent malicious use the changing of the language is prevented unless you pass a `true` flag to it.

In some instances it is necessary to know in advance if a key has a value or not, in this case you can use `has`.

```JavaScript
var translate = i18n_core({title: "My Website"})
translate.has("title") // true
translate.has("subtitle") // false
```

Additionally, for module development, its possible to access the raw data using `raw`:

```JavaScript
var translate = i18n_core({no: {val: 5}})
translate.raw("no") // {val: 5}
```

If you have any questions, please post them as issue, thanks!
