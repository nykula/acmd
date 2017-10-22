const assign = require("lodash/assign");
const Component = require("inferno-component").default;
const Gtk = imports.gi.Gtk;
const h = require("inferno-hyperscript").default;
const isEqual = require("lodash/isEqual");
const autoBind = require("../Gjs/autoBind").default;
const KeyListener = require("../Gjs/KeyListener").default;
const ListStore = require("../ListStore/ListStore");
const range = require("lodash/range");
const select = require("./select").default;

/**
 * @typedef {object} IProps
 * @property {any} cols
 * @property {number} cursor
 * @property {Function} on_activated
 * @property {Function} on_clicked
 * @property {Function} on_cursor
 * @property {Function} on_key_press_event
 * @property {Function} on_layout
 * @property {Function} on_search
 * @property {Function} on_selected
 * @property {any} rows
 * @property {number[]} selected
 *
 * @param {IProps} props
 */
function TreeView(props) {
  Component.call(this, props);
  autoBind(this, TreeView.prototype);
}

TreeView.prototype = Object.create(Component.prototype);

/**
 * @type {number}
 */
TreeView.prototype.limit = 1;

/**
 * @type {any}
 */
TreeView.prototype.node = undefined;

/**
 * @type {IProps}
 */
TreeView.prototype.props = undefined;

/**
 * @type {any}
 */
TreeView.prototype.sel = undefined;

/**
 * @type {any}
 */
TreeView.prototype.store = undefined;

TreeView.prototype.init = function(node) {
  if (!node || this.node) {
    return;
  }

  this.node = node;
  this.updateStore();
  this.node.set_search_equal_func(this.props.on_search);
  this.sel = this.node.get_selection();

  this.getCols().forEach((col, i) => {
    const tvCol = new Gtk.TreeViewColumn({ title: col.title });
    ListStore.configureColumn(tvCol, col, i);

    if (col.expand) {
      tvCol.expand = true;
    }

    if (col.min_width) {
      tvCol.min_width = col.min_width;
    }

    if (this.props.on_clicked) {
      tvCol.clickable = true;
      tvCol.connect("clicked", () => {
        this.props.on_clicked(col.name);
      });
    }

    node.insert_column(tvCol, i);
  });

  this.updateSelect();

  new KeyListener(node).on("key-press-event", this.handleKeyPressEvent);
};

TreeView.prototype.shouldComponentUpdate = function(nextProps) {
  return !isEqual(this.props, nextProps);
};

TreeView.prototype.componentDidUpdate = function(prevProps) {
  if (
    !isEqual(prevProps.cols, this.props.cols) ||
    !isEqual(prevProps.rows, this.props.rows)
  ) {
    this.updateStore();
  }

  this.updateSelect(prevProps);

  if (prevProps.on_search !== this.props.on_search) {
    this.node.set_search_equal_func(this.props.on_search);
  }
};

TreeView.prototype.getCols = function() {
  const selectedCol = {
    title: null,
    name: "selected",
    type: ListStore.CHECKBOX,
    on_toggled: this.handleToggled,
  };

  return [selectedCol].concat(this.props.cols);
};

TreeView.prototype.handleCursorChanged = function() {
  const node = this.node;

  if (node.isUpdatingSelect) {
    return;
  }

  const cursor = node.get_cursor();

  if (cursor && cursor[0]) {
    const index = cursor[0].get_indices()[0];

    if (index !== this.props.cursor) {
      this.props.on_cursor(index);
    }
  }
};

TreeView.prototype.handleKeyPressEvent = function(ev) {
  const visible = this.node.get_visible_range();
  const top = visible[1].get_indices()[0];

  const state = {
    limit: this.limit,
    indices: range(0, this.props.rows.length),
    cursor: this.props.cursor,
    selected: this.props.selected,
    top: top,
  };

  const nextState = select(state, ev);

  if (state !== nextState) {
    if (state.cursor !== nextState.cursor) {
      this.props.on_cursor(nextState.cursor);
    }

    if (!isEqual(state.selected, nextState.selected)) {
      this.props.on_selected(nextState.selected);
    }

    return true;
  }

  return this.props.on_key_press_event(ev);
};

TreeView.prototype.handleRowActivated = function(_, row) {
  const index = row.get_indices()[0];
  this.props.on_activated(index);
};

TreeView.prototype.handleSizeAllocate = function(_) {
  const node = this.node;
  const rowHeight = node.get_background_area(Gtk.TreePath.new_from_string("0"), null).height;
  const height = node.get_visible_rect().height;
  this.limit = Number((height / rowHeight).toFixed(2));
  this.props.on_layout(node);
};

TreeView.prototype.handleToggled = function(value) {
  if (this.props.selected.indexOf(value) === -1) {
    this.props.on_selected(this.props.selected.concat(value));
  } else {
    this.props.on_selected(this.props.selected.filter(x => x !== value));
  }
};

TreeView.prototype.updateSelect = function(prevProps) {
  const { node, sel, store } = this;

  node.isUpdatingSelect = true;

  sel.unselect_all();
  sel.select_path(Gtk.TreePath.new_from_string(String(this.props.cursor)));
  node.set_cursor(Gtk.TreePath.new_from_string(String(this.props.cursor)), node.get_column(1), null);

  if (prevProps) {
    prevProps.selected.forEach(x => {
      if (this.props.selected.indexOf(x) === -1) {
        store.set_value(store.iter_nth_child(null, x)[1], 0, false);
      }
    });
  }

  this.props.selected.forEach(x => {
    store.set_value(store.iter_nth_child(null, x)[1], 0, true);
  });

  node.isUpdatingSelect = false;
};

TreeView.prototype.updateStore = function() {
  this.store = ListStore.fromProps({
    cols: this.getCols(),
    rows: this.props.rows.map(row => assign({}, row, { selected: false })),
  });

  this.node.set_model(this.store);
};

TreeView.prototype.render = function() {
  return h("tree-view", {
    on_cursor_changed: this.handleCursorChanged,
    on_size_allocate: this.handleSizeAllocate,
    on_row_activated: this.handleRowActivated,
    ref: this.init,
  });
};

exports.default = TreeView;
