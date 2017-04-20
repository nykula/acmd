/* global imports */
const assign = require('lodash/assign')
const Component = require('inferno-component')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const isEqual = require('lodash/isEqual')
const KeyListener = require('../utils/KeyListener').default
const ListStore = require('../utils/ListStore')
const range = require('lodash/range')
const select = require('../utils/select').default

const TreeView = exports.default = function TreeView (props) {
  Component.call(this, props)

  this.getCols = this.getCols.bind(this)
  this.handleCursorChanged = this.handleCursorChanged.bind(this)
  this.handleKeyPressEvent = this.handleKeyPressEvent.bind(this)
  this.handleRowActivated = this.handleRowActivated.bind(this)
  this.handleSizeAllocate = this.handleSizeAllocate.bind(this)
  this.handleToggled = this.handleToggled.bind(this)
  this.init = this.init.bind(this)
  this.updateSelect = this.updateSelect.bind(this)
  this.updateStore = this.updateStore.bind(this)

  this.limit = 1
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

  new KeyListener(node).on('key-press-event', this.handleKeyPressEvent)
}

TreeView.prototype.shouldComponentUpdate = function (nextProps) {
  return !isEqual(this.props, nextProps)
}

TreeView.prototype.componentDidUpdate = function (prevProps) {
  if (
    !isEqual(prevProps.cols, this.props.cols) ||
    !isEqual(prevProps.rows, this.props.rows)
  ) {
    this.updateStore()
  }

  this.updateSelect(prevProps)

  if (prevProps.on_search !== this.props.on_search) {
    this.node.set_search_equal_func(this.props.on_search)
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

TreeView.prototype.handleKeyPressEvent = function (ev) {
  const visible = this.node.get_visible_range()
  const top = visible[1].get_indices()[0]

  const state = {
    limit: this.limit,
    indices: range(0, this.props.rows.length),
    cursor: this.props.cursor,
    selected: this.props.selected,
    top: top
  }

  const nextState = select(state, ev)

  if (state !== nextState) {
    if (state.cursor !== nextState.cursor) {
      this.props.on_cursor(nextState.cursor)
    }

    if (!isEqual(state.selected, nextState.selected)) {
      this.props.on_selected(nextState.selected)
    }

    return true
  }

  return false
}

TreeView.prototype.handleRowActivated = function (_, row) {
  const index = row.get_indices()[0]
  this.props.on_activated(index)
}

TreeView.prototype.handleSizeAllocate = function (_) {
  const node = this.node
  const rowHeight = node.get_background_area(Gtk.TreePath.new_from_string('0'), null).height
  const height = node.get_visible_rect().height
  this.limit = (height / rowHeight).toFixed(2)
  this.props.on_layout(node)
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
      if (this.props.selected.indexOf(x) === -1) {
        store.set_value(store.iter_nth_child(null, x)[1], 0, false)
      }
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
    on_size_allocate: this.handleSizeAllocate,
    on_row_activated: this.handleRowActivated,
    ref: this.init
  })
}
