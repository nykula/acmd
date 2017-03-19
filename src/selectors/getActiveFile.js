const assign = require('lodash/assign')
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activePanel = state.panels.active
  const location = state.locations[activePanel]
  const activeFile = state.files.active[activePanel]
  const file = getVisibleFiles({
    files: state.files.byPanel[activePanel],
    showHidSys: state.files.showHidSys
  })[activeFile]
  const uri = location.replace(/\/?$/, '') + '/' + file.name

  return assign({}, file, { uri: uri })
}
