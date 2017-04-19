const assign = require('lodash/assign')
const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const { cursor, files, location } = state.entities.tabs[activeTabId]

  const file = getVisibleFiles({
    files: files,
    showHidSys: state.showHidSys
  })[cursor]

  const uri = location.replace(/\/?$/, '') + '/' + file.name

  return assign({}, file, { uri: uri })
}
