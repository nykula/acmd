/* global log */

const Buffer = require('buffer/').Buffer
const expect = require('expect')

exports.it = function (title, callback) {
  log(title + ' STARTED')
  callback()
  log(title + ' SUCCESS')
}

/**
 * Sets up the environment for tests.
 */
exports.require = () => {
  window.Buffer = Buffer
  window.expect = expect
  window.it = exports.it
}
