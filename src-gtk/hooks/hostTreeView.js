/* global imports */
const GObject = imports.gi.GObject
const Gtk = imports.gi.Gtk
const Pango = imports.gi.Pango
const isEqual = require('lodash/isEqual')
const Hook = fun => Object.create({ hook: fun })

exports.default = props => Hook(hostNode => {
  const isMounting = hostNode.get_children().length === 0
  const willUpdate = !isEqual(props, hostNode.props)

  if (!isMounting && !willUpdate) {
    return
  }

  hostNode.get_children().forEach(x => x.destroy())
  hostNode.props = props

  const store = new Gtk.ListStore()
  store.set_column_types(props.cols.map(() => GObject.TYPE_STRING))

  props.rows.forEach(row => {
    store.set(
      store.append(),
      props.cols.map((x, i) => i),
      props.cols.map(col => row[col.name])
    )
  })

  const tree = new Gtk.TreeView({ enable_search: false, model: store })
  tree.get_selection().mode = Gtk.SelectionMode.MULTIPLE

  props.cols.forEach((col, i) => {
    const tvCol = new Gtk.TreeViewColumn({ title: col.title })
    let renderer

    if (col.attribute === 'icon-name') {
      renderer = new Gtk.CellRendererPixbuf()
    }

    if (col.attribute === 'text') {
      renderer = new Gtk.CellRendererText({
        ellipsize: Pango.EllipsizeMode.MIDDLE
      })
    }

    tvCol.pack_start(renderer, false)
    tvCol.add_attribute(renderer, col.attribute, i)

    if (col.expand) {
      tvCol.expand = true
    }

    if (col.min_width) {
      tvCol.min_width = col.min_width
    }

    tree.insert_column(tvCol, i)
  })

  const sel = tree.get_selection()

  if (!isMounting && !isEqual(hostNode.props.selected, props.selected)) {
    hostNode.props.selected.forEach(x => {
      sel.unselect_path(Gtk.TreePath.new_from_string(String(x)))
    })
  }

  props.selected.forEach(x => {
    sel.select_path(Gtk.TreePath.new_from_string(String(x)))
  })

  hostNode.add(tree)
  tree.show()
})
