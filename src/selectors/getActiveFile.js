const assign = require('lodash/assign')

exports.default = state => {
  const activePanel = state.panels.active
  const location = state.locations[activePanel]
  const activeFile = state.files.active[activePanel]
  const files = state.files.byPanel[activePanel]
  const file = files[activeFile]
  const path = location.replace(/\/?$/, '') + '/' + file.name

  return assign({}, file, { path: path })
}
