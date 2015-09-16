const tmenu        = require('terminal-menu')
    , path         = require('path')
    , fs           = require('fs')
    , xtend        = require('xtend')
    , vw           = require('visualwidth')

const maxListenersPerEvent = 10

process.stdin.pause()

function repeat (ch, sz) {
  return new Array(sz + 1).join(ch)
}

function applyTextMarker (truncate, width, text, marker) {
  var availableSpace = width - vw.width(marker, true)

  text = vw.truncate(text, availableSpace, '...', true)

  return text + repeat(' ', availableSpace - vw.width(text, true)) + marker
}

function createMenu (opts) {

  if (!process.stdin.isTTY)
    return null

  opts = xtend({
      separator: '\u2500'
    , truncate: '...'
  }, opts)

  var menu = tmenu(opts)
    , _add = menu.add.bind(menu)
    , _close = menu.close.bind(menu)
    , txtMarker = applyTextMarker.bind(null, opts.truncate, menu.width)
    , menuStream

  menu.entryCount = 0

  menu.add = function (label, marker, cb) {
  	if (typeof marker == 'function') {
  		cb = marker
  		marker = null
  	}
    menu.entryCount += 1
    menu.setMaxListeners(menu.entryCount * maxListenersPerEvent)
    _add(txtMarker(label, marker || '', menu.width), function () {
      if (typeof cb === 'function')
        cb(label, marker)
    })
  }

  menu.writeLine = function (label, marker) {
    menu.write(txtMarker(label, marker || '', menu.width) + '\n')
  }

  menu.writeSeparator = function () {
  	menu.write(repeat(opts.separator, menu.width) + '\n')
  }

  menu.close = function () {
    menu.y = 0
    menu.reset()
    _close()
    close()
  }

  menu.reset()

  function passDataToMenu (data) {
    // Node 0.10 fix
    menuStream.write(data)
  }

  function close() {
    process.stdin.pause()
    process.stdin.removeListener('data', passDataToMenu)
    menuStream.unpipe(process.stdout)
    process.stdin.unpipe(menuStream)
    process.stdin.setRawMode(false)
  }

  menu.on('select', menu.close.bind(menu))

  menuStream = menu.createStream()
  process.stdin
    .on("data", passDataToMenu)

  menuStream.pipe(process.stdout, {end: false})
  menuStream.on('end', close)
  process.stdin.setRawMode(true)
  process.stdin.resume()

  return menu
}


module.exports = createMenu