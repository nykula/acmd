const assign = require('lodash/assign')
const getActiveTabId = require('./getActiveTabId').default
const getVisibleFiles = require('./getVisibleFiles').default

exports.default = state => {
  const activeTabId = getActiveTabId(state)
  const { files, location, selected } = state.entities.tabs[activeTabId]

  const visibleFiles = getVisibleFiles({
    files: files,
    showHidSys: state.showHidSys
  })

  const visSel = visibleFiles.filter((x, i) => selected.indexOf(i) !== -1)

  return visSel.map(file => assign({}, file, {
    uri: location.replace(/\/?$/, '') + '/' + file.name
  }))
}
