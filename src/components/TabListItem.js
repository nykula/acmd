/* global imports */
const { connect } = require('inferno-redux')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const panelsActions = require('../actions/panels')
const ToggleButton = require('./ToggleButton').default

exports.TabListItem = TabListItem
function TabListItem ({ active, icon, onClicked, location }) {
  let text = location.replace(/^.*\//, '') || '/'
  return (
    h(ToggleButton, {
      active: active,
      can_focus: false,
      on_clicked: onClicked,
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
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { id, panelId }) {
  return {
    location: state.entities.tabs[id].location
  }
}

exports.mapDispatchToProps = mapDispatchToProps
function mapDispatchToProps (dispatch, { id, panelId }) {
  return {
    onClicked: () => dispatch(panelsActions.activeTabId({
      panelId: panelId,
      tabId: id
    }))
  }
}

exports.default = connect(mapStateToProps, mapDispatchToProps)(TabListItem)
