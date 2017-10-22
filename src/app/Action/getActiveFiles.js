const getCursor = require('../Action/getCursor').default
const getSelected = require('../Action/getSelected').default

/**
 * @param {*} state
 */
exports.default = function (state) {
  let files = getSelected(state)

  if (!files.length) {
    files = [getCursor(state)]
  }

  return files
}
