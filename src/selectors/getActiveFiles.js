const getCursor = require('./getCursor').default
const getSelected = require('./getSelected').default

exports.default = function (state) {
  let files = getSelected(state)

  if (!files.length) {
    files = [getCursor(state)]
  }

  return files
}
