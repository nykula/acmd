const { connect } = require('inferno-redux')
const formatSize = require('../Size/formatSize').default
const getVisibleFiles = require('../Action/getVisibleFiles').default
const h = require('inferno-hyperscript')

exports.Stats = Stats
function Stats ({ selectedCount, selectedSize, totalCount, totalSize }) {
  return (
    h('box', { border_width: 4 }, [
      h('label', {
        label: formatSize(selectedSize) + ' / ' + formatSize(totalSize) +
        ' in ' + selectedCount + ' / ' + totalCount + ' file(s)'
      })
    ])
  )
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  const tabId = state.panels[panelId].activeTabId

  const files = getVisibleFiles({
    files: state.tabs[tabId].files,
    showHidSys: state.showHidSys
  })

  const selected = state.tabs[tabId].selected

  return {
    selectedCount: selected.length,
    selectedSize: totalSize(files.filter((x, i) => selected.indexOf(i) !== -1)),
    totalCount: files.length,
    totalSize: totalSize(files)
  }
}

exports.default = connect(mapStateToProps)(Stats)

exports.totalSize = totalSize
function totalSize (files) {
  return files.map(x => x.size).reduce((prev, x) => prev + x, 0)
}
