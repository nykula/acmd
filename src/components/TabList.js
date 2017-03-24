/* global imports */
const { connect } = require('inferno-redux')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')

exports.TabList = TabList
function TabList ({ activeTabId, tabs }) {
  return tabs.length === 1 ? h('box') : (
    h('box', [
      tabs.map(({ icon, id, location }) => {
        const active = activeTabId === id
        let text = location.replace(/^.*\//, '') || '/'
        return (
          h(active ? 'toggle-button' : 'button', {
            active: active,
            key: id,
            relief: Gtk.ReliefStyle.NONE
          }, [
            h('box', { spacing: 4 }, [
              icon ? (
                  h('image', {
                    icon_name: icon + '-symbolic',
                    icon_size: Gtk.IconSize.SMALL_TOOLBAR
                  })
                ) : null,
              h('label', { label: text })
            ])
          ])
        )
      })
    ])
  )
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  const ids = state.panels.tabIds[panelId]
  return {
    activeTabId: state.panels.activeTabId[panelId],
    tabs: ids.map(id => ({
      id: id,
      location: state.locations[id]
    }))
  }
}

exports.default = connect(mapStateToProps)(TabList)
