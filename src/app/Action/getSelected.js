const getActiveTabId = require('../Tab/getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

/**
 * @param {*} state
 */
exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const { files, selected } = state.tabs[activeTabId]

  const visibleFiles = getVisibleFiles({
    files: files,
    showHidSys: state.showHidSys
  })

  return visibleFiles.filter((
    /** @type {*} */
    _,

    /** @type {number} */
    i
  ) => selected.indexOf(i) !== -1)
}
