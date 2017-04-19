const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const { files, selected } = state.entities.tabs[activeTabId]

  const visibleFiles = getVisibleFiles({
    files: files,
    showHidSys: state.showHidSys
  })

  return visibleFiles.filter((x, i) => selected.indexOf(i) !== -1)
}
