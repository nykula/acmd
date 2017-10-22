const { connect } = require('inferno-redux')
const h = require('inferno-hyperscript')
const TabListItem = require('./TabListItem').default

exports.TabList = TabList
function TabList ({ activeTabId, panelId, tabIds }) {
  return tabIds.length === 1 ? h('box') : (
    h('box', [
      tabIds.map(id => (
        h(TabListItem, {
          active: activeTabId === id,
          id: id,
          panelId: panelId,
          key: id
        })
      ))
    ])
  )
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  return {
    activeTabId: state.panels[panelId].activeTabId,
    tabIds: state.panels[panelId].tabIds
  }
}

exports.default = connect(mapStateToProps)(TabList)
