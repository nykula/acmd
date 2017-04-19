/* global imports */
const Directory = require('./Directory').default
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const Location = require('./Location').default
const Mount = require('./Mount').default
const Stats = require('./Stats').default
const TabList = require('./TabList').default

exports.default = Panel
function Panel ({ id }) {
  return (
    h('box', { orientation: Gtk.Orientation.VERTICAL }, [
      h(Mount, {
        key: 'MOUNT',
        panelId: id
      }),
      h(TabList, {
        key: 'TAB_LIST',
        panelId: id
      }),
      h('h-separator'),
      h(Location, {
        key: 'LOCATION',
        panelId: id
      }),
      h('h-separator'),
      h(Directory, {
        key: 'DIRECTORY',
        panelId: id
      }),
      h(Stats, {
        key: 'STATS',
        panelId: id
      })
    ])
  )
}
