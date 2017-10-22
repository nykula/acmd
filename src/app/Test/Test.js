/* global log */

const Buffer = require('buffer/').Buffer

exports.it = function (title, callback) {
  log(title + ' STARTED')
  callback()
  log(title + ' SUCCESS')
}

exports.find = find
function find (tree, callback) {
  return tree.children.filter(callback)[0]
}

exports.shallow = shallow
function shallow (tree) {
  if (tree.flags === 4) {
    const Component = tree.type
    return new Component(tree.props).render()
  }

  return tree.type(tree.props)
}

/**
 * Sets up the environment for tests.
 */
exports.require = () => {
  window.Buffer = Buffer
  window.it = exports.it
}
