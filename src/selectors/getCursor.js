const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const { cursor, files } = state.entities.tabs[activeTabId]

  const file = getVisibleFiles({
    files: files,
    showHidSys: state.showHidSys
  })[cursor]

  return file
}
