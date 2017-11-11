const Gtk = imports.gi.Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { TreeViewRow } = require("../../domain/TreeView/TreeViewRow");
const autoBind = require("../Gjs/autoBind").default;
const KeyListener = require("../Gjs/KeyListener").default;
const { configureColumn, setCols, setValue } = require("../ListStore/ListStore");

function Col() {
  this.name = "";
  this.type = "";
}

/**
 * @typedef GdkRectangle
 * @property {number} height
 */

/**
 * @typedef GtkListStore
 * @property {() => any} append
 * @property {() => void} clear
 * @property {(iter: any) => string} get_string_from_iter
 * @property {Col[]} cols Non-standard property.
 * @property {(iter: any, sibling: any | null) => void} move_before
 * @property {(iter: any) => void} remove
 * @property {(types: any[]) => void} set_column_types
 * @property {(iter: any, column: number, value: any) => void} set_value
 */

/**
 * @typedef GtkTreeViewPath
 * @property {() => number[]} get_indices
 */

/**
 * @typedef IBody
 * @property {any[]} children
 * @property {GtkListStore} store
 */

/**
 * @param {TreeView} node
 */
function TreeView(node) {
  this.useNodeAsThis.call(node);
  return node;
}

/**
 * @type {IBody}
 */
TreeView.prototype.body = undefined;

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
 * @type {GtkListStore}
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
    firstChild: { get: () => this.body },
    keyPressEventCallback: { set: callback => this.setKeyPressEventCallback(callback) },
    layoutCallback: { set: callback => this.setLayoutCallback(callback) },
  });

  this.connect("button_press_event", (_, ev) => {
    this.mouseEvent = ev;
  });

  this.set_search_equal_func(this.shouldSearchSkip);
};

/**
 * @param {Col[]} cols
 */
TreeView.prototype.setCols = function(cols) {
  this.setCols = _cols => {
    const tvCols = this.get_columns();
    for (let i = 0; i < _cols.length; i++) {
      tvCols[i].title = _cols[i].title;
    }
  };

  const store = new Gtk.ListStore();
  setCols(store, cols);

  for (let i = 0; i < store.cols.length; i++) {
    const col = store.cols[i];
    const tvCol = new Gtk.TreeViewColumn({ title: col.title });
    configureColumn(tvCol, col, i);

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

    this.insert_column(tvCol, i);
  }

  this.store = store;
};

/**
 * Initial children appended, `store` attached.
 */
TreeView.prototype.didMount = function() {
  this.didMount = noop;
  this.body.store = this.store;
};

/**
 * @param {IBody} newChild
 */
TreeView.prototype.appendChild = function(newChild) {
  this.body = newChild;

  Object.defineProperties(this.body, {
    parentNode: { value: this },
  });
};

/**
 * @param {(index: number) => void} callback
 */
TreeView.prototype.setActivatedCallback = function(callback) {
  this.setActivatedCallback = noop;

  this.connect("row_activated", (_, path) => {
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

      const index = cursor[0].get_indices()[0];
      callback({ index, mouseEvent });
    }
  });
};

/**
 * @param {(ev: { limit: number, top: number }) => boolean} shouldPreventDefault
 */
TreeView.prototype.setKeyPressEventCallback = function(callback) {
  this.setKeyPressEventCallback = noop;

  new KeyListener(this).on("key-press-event", (ev) => {
    const visible = this.get_visible_range();
    const top = visible[1] ? visible[1].get_indices()[0] : 0;

    const cursor = Gtk.TreePath.new_from_string(String(this._cursor));
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
  const path = Gtk.TreePath.new_from_string(String(rowIndex));

  sel.unselect_all();
  sel.select_path(path);
  this.set_cursor(path, this.get_columns()[1], null);
  this._cursor = rowIndex;

  this.shouldReactToCursorChanges = true;
};

/**
 * @param {(node: TreeView) => void} callback
 */
TreeView.prototype.setLayoutCallback = function(callback) {
  this.setLayoutCallback = noop;

  this.connect("size_allocate", () => {
    const rowHeight = this.get_background_area(Gtk.TreePath.new_from_string("0"), null).height;
    const height = this.get_visible_rect().height;
    this.limit = Number((height / rowHeight).toFixed(2));
    this.didMount();
    callback(this);
  });
};

/**
 * @param {GtkListStore} store
 * @param {string} input
 * @param {any} iter
 */
TreeView.prototype.shouldSearchSkip = function(store, _, input, iter) {
  const index = Number(store.get_string_from_iter(iter));

  if (index === this._cursor) {
    for (let i = 0; i < this.body.children.length; i++) {
      if (i !== index && !this.body.children[i].shouldSearchSkip(input)) {
        return true;
      }
    }

    return false;
  }

  return this.body.children[index].shouldSearchSkip(input);
};

/**
 * Native method. Adds event listener.
 * @type {(evName: string, callback: Function) => void}
 */
TreeView.prototype.connect = undefined;

/**
 * Native method. Returns area of one row.
 * @type {(path: GtkTreeViewPath, column: null) => GdkRectangle}
 */
TreeView.prototype.get_background_area = undefined;

/**
 * Native method. Returns position of row in visible window ara.
 * @type {(path: GtkTreeViewPath, column: null) => GdkRectangle}
 */
TreeView.prototype.get_cell_area = undefined;

/**
 * Native method. Returns column nodes.
 * @type {() => { clickable: boolean, connect(evName: string, callback: Function): void, title: string }[]}
 */
TreeView.prototype.get_columns = undefined;

/**
 * Native method. Returns paths in cursor.
 * @type {() => GtkTreeViewPath[]}
 */
TreeView.prototype.get_cursor = undefined;

/**
 * Native method. Returns selection object.
 * @type {() => { select_path(path: GtkTreeViewPath): void, unselect_all(): void }}
 */
TreeView.prototype.get_selection = undefined;

/**
 * Native method. Returns visible paths.
 * @type {() => GtkTreeViewPath[]}
 */
TreeView.prototype.get_visible_range = undefined;

/**
 * Native method. Returns visible area.
 * @type {() => GdkRectangle}
 */
TreeView.prototype.get_visible_rect = undefined;

/**
 * Native method. Returns host window.
 */
TreeView.prototype.get_window = undefined;

/**
 * Native method. Assigns column to position.
 * @type {(gtkTreeViewColumn: any, columnIndex: number) => void}
 */
TreeView.prototype.insert_column = undefined;

/**
 * Native method. Sets path as cursor.
 * @type {(path: GtkTreeViewPath, columnIter: any, startEdit: boolean) => void} set_cursor
 */
TreeView.prototype.set_cursor = undefined;

/**
 * Native method. Sets function called for every row during search.
 * @type {(shouldSkipRow: (store: GtkListStore, column: number, input: string, iter: any) => boolean) => void}
 */
TreeView.prototype.set_search_equal_func = undefined;

exports.TreeView = TreeView;
