/* global imports */
const Gio = imports.gi.Gio
const GObject = imports.gi.GObject
const Gtk = imports.gi.Gtk
const Icon = require('../utils/Icon').default
const Pango = imports.gi.Pango

exports.fromProps = function (props) {
  const store = new Gtk.ListStore()

  store.set_column_types(props.cols.map(col => {
    if (col.attribute === 'gicon') {
      return Gio.Icon
    }

    return GObject.TYPE_STRING
  }))

  props.rows.forEach(row => {
    store.set(
      store.append(),
      props.cols.map((x, i) => i),
      props.cols.map(col => {
        if (col.attribute === 'gicon') {
          return Icon(row[col.name])
        }

        return row[col.name]
      })
    )
  })

  return store
}

exports.configureColumn = function (node, col, i) {
  let renderer

  if (col.attribute === 'gicon') {
    renderer = new Gtk.CellRendererPixbuf()
  }

  if (col.attribute === 'text') {
    renderer = new Gtk.CellRendererText({
      ellipsize: Pango.EllipsizeMode.MIDDLE
    })
  }

  node[col.pack || 'pack_start'](renderer, false)
  node.add_attribute(renderer, col.attribute, i)
}
