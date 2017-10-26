const Gtk = imports.gi.Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const autoBind = require("../Gjs/autoBind").default;
const KeyListener = require("../Gjs/KeyListener").default;
const { configureColumn, setCols, setValue } = require("../ListStore/ListStore");
const { TreeViewRow } = require("./TreeViewRow");

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
 * @param {TreeView} node
 */
function TreeView(node) {
  this.useNodeAsThis.call(node);
  return node;
}

/**
 * Cursor row index, used in setters of `cursor` and `cursorCallback`.
 * @type {number}
 */
TreeView.prototype._cursor = undefined;

/**
 * Rows per screen.
 * @type {number}
 */
TreeView.prototype.limit = undefined;

/**
 * @type {TreeViewRow[]}
 */
TreeView.prototype.rows = undefined;

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
  this.rows = [];
  this.shouldReactToCursorChanges = true;

  autoBind(this, TreeView.prototype);

  Object.defineProperties(this, {
    activatedCallback: { set: callback => this.setActivatedCallback(callback) },
    clickedCallback: { set: callback => this.setClickedCallback(callback) },
    cols: { set: value => this.setCols(value) },
    cursor: { set: value => this.setCursor(value) },
    cursorCallback: { set: callback => this.setCursorCallback(callback) },
    firstChild: { get: () => this.rows[0] },
    keyPressEventCallback: { set: callback => this.setKeyPressEventCallback(callback) },
    layoutCallback: { set: callback => this.setLayoutCallback(callback) },
    textContent: { set: () => this.clear() },
  });

  this.set_search_equal_func(this.shouldSearchSkip);
};

/**
 * @param {Col[]} cols
 */
TreeView.prototype.setCols = function(cols) {
  this.setCols = noop;
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

    this.insert_column(tvCol, i);
  }

  this.set_model(store);
  this.store = store;
};

/**
 * Initial children appended, `store` attached.
 */
TreeView.prototype.didMount = function() {
  this.didMount = noop;

  for (const row of this.rows) {
    this.ensureInit(row);
  }
};

/**
 * @param {TreeViewRow} row
 */
TreeView.prototype.ensureInit = function(row) {
  if (row.iter) {
    return;
  }

  Object.defineProperties(row, {
    nextSibling: {
      get: () => this.rows[this.rows.indexOf(row) + 1],
    },
  });

  row.iter = this.store.append();
  row.parentNode = this;

  const setAttribute = (name, value) => {
    setValue(this.store, row.iter, name, value);
  };

  for (const name of Object.keys(row)) {
    setAttribute(name, row[name]);
  }

  row.setAttribute = setAttribute;
};

/**
 * @param {TreeViewRow} newChild
 * @param {TreeViewRow=} existingChild
 */
TreeView.prototype.insertBefore = function(newChild, existingChild) {
  this.ensureInit(newChild);
  this.store.move_before(newChild.iter, existingChild ? existingChild.iter : null);
  const index = this.rows.indexOf(existingChild);

  if (index === -1) {
    this.rows.push(newChild);
  } else {
    this.rows.splice(index, 0, newChild);
  }

  return newChild;
};

/**
 * @param {TreeViewRow} newChild
 */
TreeView.prototype.appendChild = function(newChild) {
  if (this.store) {
    this.insertBefore(newChild);
  } else {
    this.rows.push(newChild);
  }
};

/**
 * @param {TreeViewRow} row
 */
TreeView.prototype.removeChild = function(row) {
  this.store.remove(row.iter);
  this.rows.splice(this.rows.indexOf(row), 1);
  return row;
};

/**
 * @param {TreeViewRow} newChild
 * @param {TreeViewRow} oldChild
 */
TreeView.prototype.replaceChild = function(newChild, oldChild) {
  this.insertBefore(newChild, oldChild);
  return this.removeChild(oldChild);
};

TreeView.prototype.clear = function() {
  this.store.clear();
  this.rows.splice(0);
};

/**
 * @param {(rowIndex: number) => void} callback
 */
TreeView.prototype.setActivatedCallback = function(callback) {
  this.setActivatedCallback = noop;

  this.connect("row_activated", (_, path) => {
    const index = path.get_indices()[0];
    callback(index);
  });
};

/**
 * @param {(colName: string) => void} callback
 */
TreeView.prototype.setClickedCallback = function(callback) {
  const tvCols = this.get_columns();

  for (let i = 0; i < tvCols.length; i++) {
    const tvCol = tvCols[i];
    tvCol.clickable = true;
    tvCol.connect("clicked", () => {
      callback(this.store.cols[i].name);
    });
  }
};

/**
 * @param {(rowIndex: number) => void} callback
 */
TreeView.prototype.setCursorCallback = function(callback) {
  this.setCursorCallback = noop;

  this.connect("cursor_changed", () => {
    if (!this.shouldReactToCursorChanges) {
      return;
    }

    const cursor = this.get_cursor();

    if (cursor && cursor[0]) {
      const index = cursor[0].get_indices()[0];

      if (index !== this._cursor) {
        callback(index);
      }
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
    const top = visible[1].get_indices()[0];

    const shouldPreventDefault = callback(assign({}, ev, {
      limit: this.limit,
      top,
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
    for (const row of this.rows) {
      if (!row.shouldSearchSkip(input)) {
        return true;
      }
    }

    return false;
  }

  return this.rows[index].shouldSearchSkip(input);
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
 * Native method. Returns column nodes.
 * @type {() => { clickable: boolean, connect(evName: string, callback: Function): void }[]}
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
 */
TreeView.prototype.get_visible_range = undefined;

/**
 * Native method. Returns visible area.
 * @type {() => GdkRectangle}
 */
TreeView.prototype.get_visible_rect = undefined;

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
 * Native method. Sets store as model.
 * @type {(store: GtkListStore) => void}
 */
TreeView.prototype.set_model = undefined;

/**
 * Native method. Sets function called for every row during search.
 * @type {(shouldSkipRow: (store: GtkListStore, column: number, input: string, iter: any) => boolean) => void}
 */
TreeView.prototype.set_search_equal_func = undefined;

exports.TreeView = TreeView;
