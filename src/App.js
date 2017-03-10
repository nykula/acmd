/* global imports */

const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const ActionBar = require('./components/ActionBar').default
const MenuBar = require('./components/MenuBar').default
const Panel = require('./components/Panel').default
const Prompt = require('./components/Prompt').default
const Toolbar = require('./components/Toolbar').default
const VolumeList = require('./components/VolumeList').default

exports.render = () => {
  return (
    h('box', { orientation: Gtk.Orientation.VERTICAL }, [
      h(MenuBar),
      h(Toolbar),
      h('h-separator'),
      h('h-box', [
        h(VolumeList, { panelId: 0 }),
        h(VolumeList, { panelId: 1 })
      ]),
      h('h-separator'),
      h('h-box', { spacing: 1 }, [
        [0, 1].map(panelId => h(Panel, {
          id: panelId,
          key: panelId
        }))
      ]),
      h(Prompt),
      h(ActionBar)
    ])
  )
}
