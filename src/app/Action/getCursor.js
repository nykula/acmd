const getActiveTabId = require('../Tab/getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

/**
 * @param {*} state
 */
exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const { cursor, files } = state.tabs[activeTabId]

  const file = getVisibleFiles({
    files: files,
    showHidSys: state.showHidSys
  })[cursor]

  return file
}
