/* global imports */
const GObject = imports.gi.GObject
const Gtk = imports.gi.Gtk
const Pango = imports.gi.Pango
const isEqual = require('lodash/isEqual')
const Hook = fun => Object.create({ hook: fun })

exports.default = props => Hook(hostNode => {
  const isMounting = hostNode.get_children().length === 0
  const willUpdate = !isEqual(props, prevProps)

  if (!isMounting && !willUpdate) {
    return
  }

  let node
  let prevProps

  if (!isMounting) {
    node = hostNode.get_children()[0]
    prevProps = node.props
  }

  if (
    isMounting ||
    !isEqual(prevProps.cols, props.cols) ||
    !isEqual(prevProps.rows, props.rows) ||
    !isEqual(prevProps.on_selected, props.on_selected)
  ) {
    if (!isMounting) {
      node.destroy()
    }

    const store = new Gtk.ListStore()
    store.set_column_types(props.cols.map(() => GObject.TYPE_STRING))

    props.rows.forEach(row => {
      store.set(
        store.append(),
        props.cols.map((x, i) => i),
        props.cols.map(col => row[col.name])
      )
    })

    node = new Gtk.TreeView({ enable_search: false, model: store })
    const sel = node.get_selection()
    sel.mode = Gtk.SelectionMode.MULTIPLE

    node.connect('cursor-changed', () => {
      if (node.isUpdatingSelect) {
        return
      }

      const cursor = node.get_cursor()

      if (cursor && cursor[0]) {
        const index = cursor[0].get_indices()[0]

        if (index !== props.cursor) {
          props.on_cursor(index)
        }
      }
    })

    sel.connect('changed', () => {
      if (node.isUpdatingSelect) {
        return
      }

      const selected = sel.get_selected_rows().reduce((prev, x) => {
        return !x.reduce ? prev : x.reduce((prev, y) => {
          return prev.concat(y.get_indices())
        }, prev)
      }, [])

      if (!isEqual(props.selected)) {
        props.on_selected(selected)
      }
    })

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

      node.insert_column(tvCol, i)
    })

    hostNode.add(node)
    node.show()
  }

  ((sel) => {
    node.isUpdatingSelect = true

    sel.unselect_all()

    props.selected.forEach(x => {
      sel.select_path(Gtk.TreePath.new_from_string(String(x)))
    })

    node.set_cursor(Gtk.TreePath.new_from_string(String(props.cursor)), null, null)

    node.isUpdatingSelect = false
  })(node.get_selection())

  node.props = props
})
