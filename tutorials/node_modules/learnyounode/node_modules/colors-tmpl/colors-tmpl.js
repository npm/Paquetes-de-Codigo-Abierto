var colors = require('colors/safe')

  , types = Object.getOwnPropertyNames(colors).filter(function (k) {
      return /^[a-z]+$/.test(k) && typeof colors[k] == 'function'
    })

  , translators = types.map(function (type) {
      var re = new RegExp('\\{' + type + '\\}([\\s\\S]*?)\\{/' + type + '\\}', 'g')
      return function (str) {
        return str.replace(re, function (_, s) {
          return colors[type](s)
        })
      }
    })


function render (str) {
  return translators.reduce(
      function (str, fn) { return fn(str) }
    , str
  )
}


module.exports = render