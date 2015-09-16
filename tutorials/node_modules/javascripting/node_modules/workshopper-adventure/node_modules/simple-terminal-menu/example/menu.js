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