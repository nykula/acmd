/* global imports */
const Component = require('inferno-component')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const isEqual = require('lodash/isEqual')
const ListStore = require('../utils/ListStore')

const TreeView = exports.default = function TreeView (props) {
  Component.call(this, props)

  this.handleCursorChanged = this.handleCursorChanged.bind(this)
  this.handleRowActivated = this.handleRowActivated.bind(this)
  this.handleSelectionChanged = this.handleSelectionChanged.bind(this)
  this.init = this.init.bind(this)
  this.updateSelect = this.updateSelect.bind(this)
}

TreeView.prototype = Object.create(Component.prototype)

TreeView.prototype.init = function (node) {
  if (!node || this.node) {
    return
  }

  this.node = node
  this.node.set_model(ListStore.fromProps(this.props))
  this.node.set_search_equal_func(this.props.on_search)

  const sel = this.sel = this.node.get_selection()
  sel.mode = Gtk.SelectionMode.MULTIPLE
  sel.connect('changed', this.handleSelectionChanged)

  this.props.cols.forEach((col, i) => {
    const tvCol = new Gtk.TreeViewColumn({ title: col.title })
    ListStore.configureColumn(tvCol, col, i)

    if (col.expand) {
      tvCol.expand = true
    }

    if (col.min_width) {
      tvCol.min_width = col.min_width
    }

    if (this.props.on_clicked) {
      tvCol.clickable = true
      tvCol.connect('clicked', () => {
        this.props.on_clicked(col.name)
      })
    }

    node.insert_column(tvCol, i)
  })

  this.updateSelect()
}

TreeView.prototype.shouldComponentUpdate = function (nextProps) {
  return !isEqual(this.props, nextProps)
}

TreeView.prototype.componentDidUpdate = function (prevProps) {
  const { node, sel } = this

  if (
    !isEqual(prevProps.cols, this.props.cols) ||
    !isEqual(prevProps.rows, this.props.rows)
  ) {
    node.set_model(ListStore.fromProps(this.props))
  }

  node.isUpdatingSelect = true

  sel.unselect_all()

  this.props.selected.forEach(x => {
    sel.select_path(Gtk.TreePath.new_from_string(String(x)))
  })

  node.set_cursor(Gtk.TreePath.new_from_string(String(this.props.cursor)), null, null)

  node.isUpdatingSelect = false

  if (prevProps.on_search !== this.props.on_search) {
    node.set_search_equal_func(this.props.on_search)
  }
}

TreeView.prototype.handleCursorChanged = function () {
  const node = this.node

  if (node.isUpdatingSelect) {
    return
  }

  const cursor = node.get_cursor()

  if (cursor && cursor[0]) {
    const index = cursor[0].get_indices()[0]

    if (index !== this.props.cursor) {
      this.props.on_cursor(index)
    }
  }
}

TreeView.prototype.handleRowActivated = function (_, row) {
  const index = row.get_indices()[0]
  this.props.on_activated(index)
}

TreeView.prototype.handleSelectionChanged = function () {
  if (this.node.isUpdatingSelect) {
    return
  }

  const selected = this.sel.get_selected_rows().reduce((prev, x) => {
    return !x.reduce ? prev : x.reduce((prev, y) => {
      return prev.concat(y.get_indices())
    }, prev)
  }, [])

  if (!isEqual(this.props.selected, selected)) {
    this.props.on_selected(selected)
  }
}

TreeView.prototype.updateSelect = function () {
  const { node, sel } = this

  node.isUpdatingSelect = true

  sel.unselect_all()

  this.props.selected.forEach(x => {
    sel.select_path(Gtk.TreePath.new_from_string(String(x)))
  })

  node.set_cursor(Gtk.TreePath.new_from_string(String(this.props.cursor)), null, null)

  node.isUpdatingSelect = false
}

TreeView.prototype.render = function () {
  return h('tree-view', {
    on_cursor_changed: this.handleCursorChanged,
    on_row_activated: this.handleRowActivated,
    ref: this.init
  })
}
