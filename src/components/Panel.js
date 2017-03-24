/* global imports */
const Directory = require('./Directory').default
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const Location = require('./Location').default
const Mount = require('./Mount').default
const TabList = require('./TabList').default

exports.Stats = Stats
function Stats () {
  return (
    h('box', { border_width: 4 }, [
      h('label', { label: '0 k / 43 k in 0 / 12 file(s)' })
    ])
  )
}

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
      Stats({
        key: 'STATS'
      })
    ])
  )
}
