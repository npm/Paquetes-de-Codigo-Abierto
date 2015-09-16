const execWrapPath = require.resolve('./exec-wrap')
    , os           = require('os')
    , path         = require('path')
    , fs           = require('fs')
    , assert       = require('assert')
    , xtend        = require('xtend')
    , after        = require('after')

function fix (exercise) {
  var dataPath = path.join(os.tmpDir(), '~workshopper.wraptmp.' + process.pid)
  var submissionPath = dataPath + '-submission'
  var solutionPath   = dataPath + '-solution'

  exercise.wrapData = {}
  exercise.wrapMods = []

  exercise.addVerifySetup(function setup (callback) {

    this.solutionArgs.unshift('$execwrap$solution') // flag if solution
    this.solutionArgs.unshift('$execwrap$' + this.solution) // original main cmd
    this.solutionArgs.unshift('$execwrap$' + solutionPath) // path to context data
    this.solutionArgs.unshift('$execwrap$' + JSON.stringify(exercise.wrapMods)) // list of mods to load
    this.solution = execWrapPath

    this.submissionArgs.unshift('$execwrap$submission') // flag if submission
    this.submissionArgs.unshift('$execwrap$' + this.submission) // original main cmd
    this.submissionArgs.unshift('$execwrap$' + submissionPath) // path to context data
    this.submissionArgs.unshift('$execwrap$' + JSON.stringify(exercise.wrapMods)) // list of mods to load
    this.submission = execWrapPath

    var wrapData = JSON.stringify(exercise.wrapData)
    var files = [ submissionPath , solutionPath ]
    var done = after(files.length, function(err) {
      if (err)
        return callback(new Error('Error writing execwrap data: ' + (err.message || err), err))

      callback()
    })

    files.forEach(function (path) {
      fs.writeFile(path, wrapData, 'utf8', done)
    })
  })

  exercise.addVerifyProcessor(function (callback) {
    // sync... yes.. unfortunately, otherwise we'll have timing problems
    fs.readFile(submissionPath, 'utf8', function (err, data) {
      if (err)
        return callback(new Error('Error reading execwrap data: ' + (err.message || err), err))

      exercise.wrapData = JSON.parse(data)

      fs.unlink(submissionPath, function () {
        callback(null, true) // pass, nothing to fail here
      })
    })
  })

  // convenience
  exercise.wrapModule = function (mod) {
    exercise.wrapMods.push(mod)
  }

  // convenience
  exercise.wrapSet = function (k, v) {
    if (typeof k == 'string')
      exercise.wrapData[k] = v
    else if (typeof k == 'object')
      exercise.wrapData = xtend(exercise.wrapData, k)
  }

  // convenience
  exercise.wrapGet = function (k) {
    return exercise.wrapData[k]
  }
}

function wrappedexec (exercise) {
  if (typeof exercise.wrapInject != 'function' || typeof exercise.wrapSet != 'function')
    fix(exercise)
  return exercise
}

module.exports = wrappedexec