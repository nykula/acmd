const assign = require('lodash/assign')
const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const location = state.locations[activeTabId]
  const selectedFiles = state.entities.tabs[activeTabId].selected
  const visibleFiles = getVisibleFiles({
    files: state.entities.tabs[activeTabId].files,
    showHidSys: state.showHidSys
  })
  const visSel = visibleFiles.filter((x, i) => selectedFiles.indexOf(i) !== -1)
  return visSel.map(file => assign({}, file, {
    uri: location.replace(/\/?$/, '') + '/' + file.name
  }))
}
