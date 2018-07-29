const { ModifierType } = imports.gi.Gdk;
const { Pixbuf } = imports.gi.GdkPixbuf;
const Gtk = imports.gi.Gtk;
const { TreeIter, TreeModel, TreePath, TreeView, TreeViewColumn } = Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const KeyListener = require("../Gjs/KeyListener").default;
const { ListStore } = require("./ListStore");

/** @type {any} */
const undef = undefined;

/**
 * @typedef Col
 * @property {boolean=} expand
 * @property {number=} min_width
 * @property {any=} on_clicked
 * @property {string=} title
 * @property {any} type
 */

/**
 * @param {TreeView} node
 */
function ListTable(node) {
  /** @type {TreeView} */
  this.node = undef;

  /** @type {{ children: any[] }} */
  this.store = undef;

  ListTable.prototype.useNodeAsThis.call(node);
  return node;
}

/**
 * Cursor row index.
 * @type {number}
 */
ListTable.prototype._cursor = undefined;

/**
 * Rows per screen.
 * @type {number}
 */
ListTable.prototype.limit = undefined;

/**
 * Defined when user clicks a row, as opposed to key press.
 * @type {any}
 */
ListTable.prototype.mouseEvent = undefined;

/** @type {TreeView} */
ListTable.prototype.node = undefined;

/** @type {boolean} */
ListTable.prototype.shouldReactToCursorChanges = undefined;

/**
 * @param {{ children: any[] }} newChild
 */
ListTable.prototype.appendChild = function(newChild) {
  this.store = newChild;

  Object.defineProperties(this.store, {
    parentNode: { value: this },
  });
};

/**
 * @param {(index: number) => void} callback
 */
ListTable.prototype.setActivatedCallback = function(callback) {
  this.setActivatedCallback = noop;

  this.node.connect("row_activated", (/** @type {any} */ _, /** @type {any} */ path) => {
    const index = path.get_indices()[0];
    callback(index);
  });
};

/**
 * @param {Col[]} cols
 */
ListTable.prototype.setCols = function(cols) {
  let pixbufDelta = 0;

  this.setCols = (/** @type {Col[]} */ nextCols) => {
    const tvCols = this.node.get_columns();
    pixbufDelta = 0;

    for (let i = 0; i < nextCols.length; i++) {
      if (nextCols[i].type === Pixbuf) {
        pixbufDelta--;
        continue;
      }

      tvCols[i + pixbufDelta].title = nextCols[i].title || "";
    }
  };

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];

    if (col.type === Pixbuf) {
      pixbufDelta--;
      continue;
    }

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

    this.node.insert_column(tvCol, i + pixbufDelta);
  }
};

/**
 * @param {number} rowIndex
 */
ListTable.prototype.setCursor = function(rowIndex) {
  this.shouldReactToCursorChanges = false;

  const sel = this.node.get_selection();
  const path = TreePath.new_from_string(String(rowIndex));

  sel.unselect_all();
  sel.select_path(path);
  this.node.set_cursor(path, this.node.get_columns()[1], false);
  this._cursor = rowIndex;

  this.shouldReactToCursorChanges = true;
};

/**
 * @param {(ev: { index: number, mouseEvent: MouseEvent }) => void} callback
 */
ListTable.prototype.setCursorCallback = function(callback) {
  this.setCursorCallback = noop;

  this.node.connect("cursor_changed", () => {
    if (!this.shouldReactToCursorChanges) {
      return;
    }

    const cursor = this.node.get_cursor();

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
 * @param {number} dragAction
 */
ListTable.prototype.setDragAction = function(dragAction) {
  this.node.enable_model_drag_source(ModifierType.BUTTON1_MASK, [], dragAction);
  this.node.drag_source_add_uri_targets();

  this.node.enable_model_drag_dest([], dragAction);
  this.node.drag_dest_add_uri_targets();
};

/**
 * @param {(ev: { limit: number, top: number }) => boolean} callback
 */
ListTable.prototype.setKeyPressEventCallback = function(callback) {
  this.setKeyPressEventCallback = noop;

  new KeyListener(this).on("key-press-event", (/** @type {any} */ ev) => {
    const visible = this.node.get_visible_range();
    const path = /** @type {TreePath} */ visible[1];
    const top = path ? path.get_indices()[0] : 0;

    const cursor = TreePath.new_from_string(String(this._cursor));
    const rect = this.node.get_cell_area(cursor, null);
    const win = this.node.get_window();

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
 * @param {(node: TreeView) => void} callback
 */
ListTable.prototype.setLayoutCallback = function(callback) {
  this.setLayoutCallback = noop;

  this.node.connect("size_allocate", () => {
    const rowHeight = this.node.get_background_area(TreePath.new_from_string("0"), null).height;
    const height = this.node.get_visible_rect().height;
    this.limit = Number((height / rowHeight).toFixed(2));
    callback(this.node);
  });
};

/**
 * @param {TreeModel} store
 * @param {any} _
 * @param {string} input
 * @param {TreeIter} iter
 */
ListTable.prototype.shouldSearchSkip = function(store, _, input, iter) {
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

ListTable.prototype.useNodeAsThis = function() {
  this._cursor = 0;
  this.limit = 0;
  this.node = /** @type {any} */ (this);
  this.shouldReactToCursorChanges = true;

  autoBind(this, ListTable.prototype, __filename);

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

  this.node.connect("button_press_event", (/** @type {any} */ _, /** @type {any} */ ev) => {
    this.mouseEvent = ev;
  });

  this.node.set_search_equal_func(this.shouldSearchSkip);
};

exports.ListTable = ListTable;
