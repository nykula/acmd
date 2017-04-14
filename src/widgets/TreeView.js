/* global imports */
const assign = require('lodash/assign')
const Component = require('inferno-component')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const isEqual = require('lodash/isEqual')
const ListStore = require('../utils/ListStore')

const TreeView = exports.default = function TreeView(props) {
  Component.call(this, props)

  this.getCols = this.getCols.bind(this)
  this.handleCursorChanged = this.handleCursorChanged.bind(this)
  this.handleRowActivated = this.handleRowActivated.bind(this)
  this.handleToggled = this.handleToggled.bind(this)
  this.init = this.init.bind(this)
  this.updateSelect = this.updateSelect.bind(this)
  this.updateStore = this.updateStore.bind(this)
}

TreeView.prototype = Object.create(Component.prototype)

TreeView.prototype.init = function (node) {
  if (!node || this.node) {
    return
  }

  this.node = node
  this.updateStore()
  this.node.set_search_equal_func(this.props.on_search)
  this.sel = this.node.get_selection()

  this.getCols().forEach((col, i) => {
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
    this.updateStore()
  }

  this.updateSelect(prevProps)

  if (prevProps.on_search !== this.props.on_search) {
    node.set_search_equal_func(this.props.on_search)
  }
}

TreeView.prototype.getCols = function () {
  const selectedCol = {
    title: null,
    name: 'selected',
    type: ListStore.CHECKBOX,
    on_toggled: this.handleToggled
  }

  return [selectedCol].concat(this.props.cols)
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

TreeView.prototype.handleToggled = function (value) {
  if (this.props.selected.indexOf(value) === -1) {
    this.props.on_selected(this.props.selected.concat(value))
  } else {
    this.props.on_selected(this.props.selected.filter(x => x !== value))
  }
}

TreeView.prototype.updateSelect = function (prevProps) {
  const { node, sel, store } = this

  node.isUpdatingSelect = true

  sel.unselect_all()
  sel.select_path(Gtk.TreePath.new_from_string(String(this.props.cursor)))
  node.set_cursor(Gtk.TreePath.new_from_string(String(this.props.cursor)), node.get_column(1), null)

  if (prevProps) {
    prevProps.selected.forEach(x => {
      store.set_value(store.iter_nth_child(null, x)[1], 0, false)
    })
  }

  this.props.selected.forEach(x => {
    store.set_value(store.iter_nth_child(null, x)[1], 0, true)
  })

  node.isUpdatingSelect = false
}

TreeView.prototype.updateStore = function () {
  this.store = ListStore.fromProps({
    cols: this.getCols(),
    rows: this.props.rows.map(row => assign({}, row, { selected: false }))
  })

  this.node.set_model(this.store)
}

TreeView.prototype.render = function () {
  return h('tree-view', {
    on_cursor_changed: this.handleCursorChanged,
    on_row_activated: this.handleRowActivated,
    ref: this.init
  })
}
