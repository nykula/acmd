const assign = require('lodash/assign')
const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const location = state.locations[activeTabId]
  const activeFile = state.files.active[activeTabId]
  const file = getVisibleFiles({
    files: state.files.byTabId[activeTabId],
    showHidSys: state.files.showHidSys
  })[activeFile]
  const uri = location.replace(/\/?$/, '') + '/' + file.name

  return assign({}, file, { uri: uri })
}
