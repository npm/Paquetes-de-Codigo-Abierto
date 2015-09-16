# simple-terminal-menu
[terminal-menu](github.com/substack/terminal-menu) does a good job for starting a menu but it is a bit tedious to set-up reliably for process.stdin / process.stdout and also for the use with double width characters.

For simply taking charge of the power this terminal menu offers a few things:

## Automatically connects to process.stdin/stdout
You don't have to do that, it will just work :)

## Markers
`.add` gets an new signature

```JavaScript
.add(<label>[, <marker>][, <cb>])
```

With this you can add entries that have a right-aligned marker text shown.

## Separators
Just use ```.writeSeparator()``` to create a separator line.

## Automatic truncating of entries
If an entry exceeds the width of the menu it will be truncated with `opts.truncator` or `...`

## Writing of text
Similar like `.add` it supports `.writeLine` that allows you to write a text that is both left & right aligned.

```JavaScript
.writeLine(<left>[, <right>])
```

## tty Tests
If the terminal doesn't support TTY the  will just return a `null`.

# Installation & Usage
Install it using npm

```
npm install simple-terminal-menu --save
```

And then create a menu it in your code using

```JavaScript
var createMenu = require('../simple-terminal-menu')

function showSelection(label, marker) {
  console.log("label: " + label + "; marker: " + marker + ";")
}

function mainMenu() {
  var menu = createMenu()
  menu.writeLine("My Menu", "(tm)")
  menu.writeSeparator()
  menu.add("A", "[selected]", showSelection)
  menu.add("B", showSelection)
  menu.writeSeparator()
  menu.add("open submenu", subMenu)
  menu.add("exit", menu.close)
}

function subMenu() {
  var menu = createMenu()
  menu.writeLine("SubMenu")
  menu.writeSeparator()
  menu.add("C", "[selected]", showSelection)
  menu.add("D", showSelection)
  menu.writeSeparator()
  menu.add("cancel", mainMenu)
  menu.add("exit", menu.close)
}

mainMenu()
```

