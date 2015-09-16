var exercise      = require('workshopper-exercise')()
  , filecheck     = require('workshopper-exercise/filecheck')
  , execute       = require('workshopper-exercise/execute')
  , comparestdout = require('workshopper-exercise/comparestdout')
  , boilerplate   = require('workshopper-boilerplate')
  , wrappedexec   = require('workshopper-wrappedexec')

  , testArgs      = 'The map() method creates a new array with the results of calling a provided function on every element in this array.'.split(' ')


exercise.longCompareOutput = true

exercise = filecheck(exercise)
exercise = execute(exercise)
exercise = comparestdout(exercise)
exercise = boilerplate(exercise)
exercise = wrappedexec(exercise)

exercise.addBoilerplate(require.resolve('./boilerplate/map.js'))

exercise.wrapModule(require.resolve('./wrap'))

exercise.addSetup(function (mode, callback) {
  // first arg to child processes
  this.submissionArgs = testArgs.concat(this.submissionArgs)
  this.solutionArgs = testArgs.concat(this.solutionArgs)
  process.nextTick(callback)
})

exercise.addVerifyProcessor(function (callback) {
  this.emit(exercise.wrapData.usedMap ? 'pass' : 'fail', 'Used Array#map()')
  callback(null, exercise.wrapData.usedMap)
})

module.exports = exercise