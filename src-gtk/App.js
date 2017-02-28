/* global imports */

const Gtk = imports.gi.Gtk
const h = require('virtual-dom/h')
const noop = require('lodash/noop')
const ActionBar = require('./components/ActionBar')
const MenuBar = require('./components/MenuBar')
const Panel = require('./components/Panel')
const Prompt = require('./components/Prompt')
const Toolbar = require('./components/Toolbar')
const VolumeList = require('./components/VolumeList')

exports.render = ({ dispatch, getState }) => {
  const state = getState()
  return (
    h('box', { orientation: Gtk.Orientation.VERTICAL }, [
      MenuBar.render(),
      Toolbar.render({ dispatch: dispatch }),
      h('h-separator'),
      h('h-box', [
        VolumeList.render({ panel: 0, volumes: state.volumes }),
        VolumeList.render({ panel: 1, volumes: state.volumes })
      ]),
      h('h-separator'),
      h('h-box', { spacing: 1 }, [
        [0, 1].map(panelId => Panel.render({
          activeFile: state.files.active[panelId],
          files: state.files.byPanel[panelId],
          dispatch: dispatch,
          id: panelId,
          isActive: state.panels.active === panelId,
          key: panelId,
          location: state.locations[panelId],
          onVolumeChanged: noop,
          sortedBy: state.files.sortedBy[panelId],
          tabs: state.tabs[panelId],
          volumes: state.volumes
        }))
      ]),
      Prompt.render({
        dispatch: dispatch,
        location: state.locations[state.panels.active]
      }),
      ActionBar.render({ dispatch: dispatch })
    ])
  )
}