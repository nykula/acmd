/* global imports */
const GObject = imports.gi.GObject
const Gtk = imports.gi.Gtk
const Pango = imports.gi.Pango
const isEqual = require('lodash/isEqual')

exports.default = function TreeView (props) {
  this.props = props
}

exports.default.prototype.type = 'Widget'

exports.default.prototype.name = 'TreeView'

exports.default.prototype.init = function (prev) {
  let node

  const store = new Gtk.ListStore()
  store.set_column_types(this.props.cols.map(() => GObject.TYPE_STRING))

  this.props.rows.forEach(row => {
    store.set(
      store.append(),
      this.props.cols.map((x, i) => i),
      this.props.cols.map(col => row[col.name])
    )
  })

  node = new Gtk.TreeView({ enable_search: false, model: store })
  node.widget = this

  const sel = node.get_selection()
  sel.mode = Gtk.SelectionMode.MULTIPLE

  node.connect('row-activated', (_, row) => {
    const index = row.get_indices()[0]
    node.widget.props.on_activated(index)
  })

  node.connect('cursor-changed', () => {
    if (node.isUpdatingSelect) {
      return
    }

    const cursor = node.get_cursor()

    if (cursor && cursor[0]) {
      const index = cursor[0].get_indices()[0]

      if (index !== node.widget.props.cursor) {
        node.widget.props.on_cursor(index)
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

    if (!isEqual(node.widget.props.selected, selected)) {
      node.widget.props.on_selected(selected)
    }
  })

  this.props.cols.forEach((col, i) => {
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

    if (this.props.on_clicked) {
      tvCol.clickable = true
      tvCol.connect('clicked', () => {
        node.widget.props.on_clicked(col.name)
      })
    }

    node.insert_column(tvCol, i)
  })

  ;((sel) => {
    node.isUpdatingSelect = true

    sel.unselect_all()

    this.props.selected.forEach(x => {
      sel.select_path(Gtk.TreePath.new_from_string(String(x)))
    })

    node.set_cursor(Gtk.TreePath.new_from_string(String(this.props.cursor)), null, null)

    node.isUpdatingSelect = false
  })(node.get_selection())

  node.show()
  return node
}

exports.default.prototype.update = function (prev, node) {
  node.widget = this
  const willUpdate = !isEqual(this.props, prev.props)

  if (!willUpdate) {
    return null
  }

  if (
    !isEqual(prev.props.cols, this.props.cols) ||
    !isEqual(prev.props.rows, this.props.rows) ||
    !isEqual(prev.props.on_selected, this.props.on_selected)
  ) {
    const nextNode = this.init(prev)

    const parent = node.parent
    node.parent.remove(node)
    parent.add(nextNode)

    return nextNode
  }

  ;((sel) => {
    node.isUpdatingSelect = true

    sel.unselect_all()

    this.props.selected.forEach(x => {
      sel.select_path(Gtk.TreePath.new_from_string(String(x)))
    })

    node.set_cursor(Gtk.TreePath.new_from_string(String(this.props.cursor)), null, null)

    node.isUpdatingSelect = false
  })(node.get_selection())

  return null
}

exports.default.prototype.destroy = function () {
}
