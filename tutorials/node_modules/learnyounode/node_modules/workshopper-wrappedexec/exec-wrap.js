const path          = require('path')
    , fs            = require('fs')
    , myargre       = /^\$execwrap\$(.*)$/
    , myargs        = process.argv.map(function (a) {
                        return myargre.test(a) && a.replace(myargre, '$1')
                      }).filter(Boolean)
    , modFiles      = JSON.parse(myargs[0])
    , mods          = []
    , ctxFile       = myargs[1]
    , ctx           = JSON.parse(fs.readFileSync(ctxFile, 'utf8'))
    , mainProgram   = ctx.mainProgram = fs.realpathSync(path.resolve(process.cwd(), myargs[2]))
    , prexit        = process.exit
    , isSolution    = myargs[3] === 'solution'
    , isSubmission  = myargs[3] === 'submission'

// remove evidence of main, modFiles, ctx
process.argv = process.argv.filter(function (a) {
  return !myargre.test(a)
})
// replace original main at position 2
process.argv.splice(1, 1, mainProgram)


// utility to catpture a stack trace at a particular method in an array
ctx.$captureStack = function captureStack (fn) {
  var err = new Error
    , stack

  Error._prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = function (err, stack) { return stack }
  Error.captureStackTrace(err, fn)
  stack = err.stack // touch it to capture it
  Error.prepareStackTrace = Error._prepareStackTrace

  return stack
}



for (var i = 0; i < modFiles.length; i++) {
  try {
    // load module
    var mod = require(modFiles[i])

    // include in submission? defaults to true
    if (isSubmission && mod.wrapSubmission === false) continue
    // include in solution? defaults to false
    if (isSolution && !mod.wrapSolution) continue
    mods.unshift(mod)

    // give it the ctx if it exports a function
    if (typeof mod == 'function')
      mod(ctx)
  } catch (e) {
    console.error('Internal error loading wrapped module', modFiles[i])
  }
}


var wrote = false


// write back the context data so it can be read by the parent
function finish () {
  if (wrote)
    return

  for (var i = 0; i < mods.length; i++) {
    if (mods[i] && typeof mods[i].finish == 'function')
      mods[i].finish(ctx)
  }

  fs.writeFileSync(ctxFile, JSON.stringify(ctx), 'utf8')
  wrote = true
}


// just in case they use it
process.exit = function () {
  finish()
  prexit.apply(process, arguments)
}


try {
  // run original main as if it were loaded directly
  require(mainProgram)
} finally {
  finish()
}
