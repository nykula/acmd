const assign = require('lodash/assign')
const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const location = state.locations[activeTabId]
  const activeFile = state.entities.tabs[activeTabId].cursor
  const file = getVisibleFiles({
    files: state.entities.tabs[activeTabId].files,
    showHidSys: state.showHidSys
  })[activeFile]
  const uri = location.replace(/\/?$/, '') + '/' + file.name

  return assign({}, file, { uri: uri })
}
