const { ModifierType, Rectangle } = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const { TreeIter, TreeModel, TreePath, TreeViewColumn } = Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const KeyListener = require("../Gjs/KeyListener").default;
const { ListStore } = require("../ListStore/ListStore");

/**
 * @typedef Col
 * @property {boolean=} expand
 * @property {number=} min_width
 * @property {any=} on_clicked
 * @property {string=} title
 * @property {string} type
 */

/**
 * @param {TreeView} node
 */
function TreeView(node) {
  TreeView.prototype.useNodeAsThis.call(node);
  return node;
}

/**
 * Cursor row index.
 * @type {number}
 */
TreeView.prototype._cursor = undefined;

/**
 * Rows per screen.
 * @type {number}
 */
TreeView.prototype.limit = undefined;

/**
 * Defined when user clicks a row, as opposed to key press.
 * @type {any}
 */
TreeView.prototype.mouseEvent = undefined;

/**
 * @type {boolean}
 */
TreeView.prototype.shouldReactToCursorChanges = undefined;

/**
 * @type {{ children: any[] }}
 */
TreeView.prototype.store = undefined;

TreeView.prototype.useNodeAsThis = function() {
  this._cursor = 0;
  this.limit = 0;
  this.shouldReactToCursorChanges = true;

  autoBind(this, TreeView.prototype, __filename);

  Object.defineProperties(this, {
    activatedCallback: { set: callback => this.setActivatedCallback(callback) },
    cols: { set: value => this.setCols(value) },
    cursor: { set: value => this.setCursor(value) },
    cursorCallback: { set: callback => this.setCursorCallback(callback) },
    dragAction: { set: value => this.setDragAction(value) },
    firstChild: { get: () => this.store },
    keyPressEventCallback: { set: callback => this.setKeyPressEventCallback(callback) },
    layoutCallback: { set: callback => this.setLayoutCallback(callback) },
  });

  this.connect("button_press_event", (/** @type {any} */ _, /** @type {any} */ ev) => {
    this.mouseEvent = ev;
  });

  this.set_search_equal_func(this.shouldSearchSkip);
};

/**
 * @param {Col[]} cols
 */
TreeView.prototype.setCols = function(cols) {
  this.setCols = (/** @type {Col[]} */ nextCols) => {
    const tvCols = this.get_columns();
    for (let i = 0; i < nextCols.length; i++) {
      tvCols[i].title = nextCols[i].title || "";
    }
  };

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    const tvCol = new TreeViewColumn();
    ListStore.bindView(tvCol, col, i);

    if (col.expand) {
      tvCol.expand = true;
    }

    if (col.min_width) {
      tvCol.min_width = col.min_width;
    }

    if (col.on_clicked) {
      tvCol.clickable = true;
      tvCol.connect("clicked", col.on_clicked);
    }

    if (col.title) {
      tvCol.title = col.title;
    }

    this.insert_column(tvCol, i);
  }
};

/**
 * @param {{ children: any[] }} newChild
 */
TreeView.prototype.appendChild = function(newChild) {
  this.store = newChild;

  Object.defineProperties(this.store, {
    parentNode: { value: this },
  });
};

/**
 * @param {(index: number) => void} callback
 */
TreeView.prototype.setActivatedCallback = function(callback) {
  this.setActivatedCallback = noop;

  this.connect("row_activated", (/** @type {any} */ _, /** @type {any} */ path) => {
    const index = path.get_indices()[0];
    callback(index);
  });
};

/**
 * @param {(ev: { index: number, mouseEvent: MouseEvent }) => void} callback
 */
TreeView.prototype.setCursorCallback = function(callback) {
  this.setCursorCallback = noop;

  this.connect("cursor_changed", () => {
    if (!this.shouldReactToCursorChanges) {
      return;
    }

    const cursor = this.get_cursor();

    if (cursor && cursor[0]) {
      const mouseEvent = this.mouseEvent;
      this.mouseEvent = undefined;

      const path = /** @type {TreePath} */ (cursor[0]);
      const index = path.get_indices()[0];

      callback({ index, mouseEvent });
    }
  });
};

/**
 * @param {(ev: { limit: number, top: number }) => boolean} callback
 */
TreeView.prototype.setKeyPressEventCallback = function(callback) {
  this.setKeyPressEventCallback = noop;

  new KeyListener(this).on("key-press-event", (/** @type {any} */ ev) => {
    const visible = this.get_visible_range();
    const path = /** @type {TreePath} */ visible[1];
    const top = path ? path.get_indices()[0] : 0;

    const cursor = TreePath.new_from_string(String(this._cursor));
    const rect = this.get_cell_area(cursor, null);
    const win = this.get_window();

    const shouldPreventDefault = callback(assign({}, ev, {
      limit: this.limit,
      rect,
      top,
      win,
    }));

    return shouldPreventDefault;
  });
};

/**
 * @param {number} rowIndex
 */
TreeView.prototype.setCursor = function(rowIndex) {
  this.shouldReactToCursorChanges = false;

  const sel = this.get_selection();
  const path = TreePath.new_from_string(String(rowIndex));

  sel.unselect_all();
  sel.select_path(path);
  this.set_cursor(path, this.get_columns()[1], false);
  this._cursor = rowIndex;

  this.shouldReactToCursorChanges = true;
};

/**
 * @param {(node: TreeView) => void} callback
 */
TreeView.prototype.setLayoutCallback = function(callback) {
  this.setLayoutCallback = noop;

  this.connect("size_allocate", () => {
    const rowHeight = this.get_background_area(TreePath.new_from_string("0"), null).height;
    const height = this.get_visible_rect().height;
    this.limit = Number((height / rowHeight).toFixed(2));
    callback(this);
  });
};

/**
 * @param {number} dragAction
 */
TreeView.prototype.setDragAction = function(dragAction) {
  this.enable_model_drag_source(ModifierType.BUTTON1_MASK, [], dragAction);
  this.drag_source_add_uri_targets();

  this.enable_model_drag_dest([], dragAction);
  this.drag_dest_add_uri_targets();
};

/**
 * @param {TreeModel} store
 * @param {any} _
 * @param {string} input
 * @param {TreeIter} iter
 */
TreeView.prototype.shouldSearchSkip = function(store, _, input, iter) {
  const index = Number(store.get_string_from_iter(iter));
  const { children } = this.store;

  if (index === this._cursor) {
    for (let i = 0; i < children.length; i++) {
      if (i !== index && !children[i].shouldSearchSkip(input)) {
        return true;
      }
    }

    return false;
  }

  return children[index].shouldSearchSkip(input);
};

/**
 * Native method. Adds event listener.
 * @type {(evName: string, callback: Function) => void}
 */
TreeView.prototype.connect = undefined;

/**
 * Native method. Adds uri list as possible drop target.
 * @type {typeof Gtk.TreeView.prototype.drag_dest_add_uri_targets}
 */
TreeView.prototype.drag_dest_add_uri_targets = undefined;

/**
 * Native method. Adds uri list as possible drag target.
 * @type {typeof Gtk.TreeView.prototype.drag_source_add_uri_targets}
 */
TreeView.prototype.drag_source_add_uri_targets = undefined;

/**
 * Native method. Enables drop.
 * @type {typeof Gtk.TreeView.prototype.enable_model_drag_dest}
 */
TreeView.prototype.enable_model_drag_dest = undefined;

/**
 * Native method. Enables drag.
 * @type {(buttonMask: number, targets: any[], dragAction: number) => void}
 */
TreeView.prototype.enable_model_drag_source = undefined;

/**
 * Native method. Returns area of one row.
 * @type {typeof Gtk.TreeView.prototype.get_background_area}
 */
TreeView.prototype.get_background_area = undefined;

/**
 * Native method. Returns position of row in visible window ara.
 * @type {typeof Gtk.TreeView.prototype.get_cell_area}
 */
TreeView.prototype.get_cell_area = undefined;

/**
 * Native method. Returns column nodes.
 * @type {typeof Gtk.TreeView.prototype.get_columns}
 */
TreeView.prototype.get_columns = undefined;

/**
 * Native method. Returns paths in cursor.
 * @type {typeof Gtk.TreeView.prototype.get_cursor}
 */
TreeView.prototype.get_cursor = undefined;

/**
 * Native method. Returns selection object.
 * @type {typeof Gtk.TreeView.prototype.get_selection}
 */
TreeView.prototype.get_selection = undefined;

/**
 * Native method. Returns visible paths.
 * @type {typeof Gtk.TreeView.prototype.get_visible_range}
 */
TreeView.prototype.get_visible_range = undefined;

/**
 * Native method. Returns visible area.
 * @type {typeof Gtk.TreeView.prototype.get_visible_rect}
 */
TreeView.prototype.get_visible_rect = undefined;

/**
 * Native method. Returns host window.
 * @type {typeof Gtk.TreeView.prototype.get_window}
 */
TreeView.prototype.get_window = undefined;

/**
 * Native method. Assigns column to position.
 * @type {typeof Gtk.TreeView.prototype.insert_column}
 */
TreeView.prototype.insert_column = undefined;

/**
 * Native method. Sets path as cursor.
 * @type {typeof Gtk.TreeView.prototype.set_cursor}
 */
TreeView.prototype.set_cursor = undefined;

/**
 * Native method. Sets function called for every row during search.
 * @type {typeof Gtk.TreeView.prototype.set_search_equal_func}
 */
TreeView.prototype.set_search_equal_func = undefined;

exports.TreeView = TreeView;
