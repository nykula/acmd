/* global imports */

const Gtk = imports.gi.Gtk
const h = require('virtual-dom/h')

exports.render = ({ onDestroy }) => (
  h('box', { orientation: Gtk.Orientation.VERTICAL, spacing: 20 }, [
    h('button', { label: 'Quit', on_clicked: onDestroy })
  ])
)
