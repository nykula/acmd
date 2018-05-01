const { ModifierType } = imports.gi.Gdk;
const { Pixbuf } = imports.gi.GdkPixbuf;
const Gtk = imports.gi.Gtk;
const { IconView, TreePath } = Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const KeyListener = require("../Gjs/KeyListener").default;

/**
 * @param {IconView} node
 */
function ListGrid(node) {
  ListGrid.prototype.useNodeAsThis.call(node);
  return node;
}

/**
 * Cursor row index.
 * @type {number}
 */
ListGrid.prototype._cursor = undefined;

/**
 * Rows per screen.
 * @type {number}
 */
ListGrid.prototype.limit = undefined;

/**
 * Defined when user clicks a row, as opposed to key press.
 * @type {any}
 */
ListGrid.prototype.mouseEvent = undefined;

/** @type {IconView} */
ListGrid.prototype.node = undefined;

/** @type {boolean} */
ListGrid.prototype.shouldReactToCursorChanges = undefined;

/** @type {{ children: any[] }} */
ListGrid.prototype.store = undefined;

/**
 * @param {{ children: any[] }} newChild
 */
ListGrid.prototype.appendChild = function(newChild) {
  this.store = newChild;

  Object.defineProperties(this.store, {
    parentNode: { value: this },
  });
};

/**
 * @param {(index: number) => void} callback
 */
ListGrid.prototype.setActivatedCallback = function(callback) {
  this.setActivatedCallback = noop;

  this.node.connect("item-activated", (_, path) => {
    const index = path.get_indices()[0];
    callback(index);
  });
};

/**
 * @param {{ type: any }[]} cols
 */
ListGrid.prototype.setCols = function(cols) {
  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];

    if (col.type === Pixbuf) {
      this.node.set_pixbuf_column(i);
    } else if (!col.type) {
      this.node.set_text_column(i);
      return;
    }
  }
};

/**
 * @param {number} rowIndex
 */
ListGrid.prototype.setCursor = function(rowIndex) {
  this.shouldReactToCursorChanges = false;

  const path = TreePath.new_from_string(String(rowIndex));

  this.node.unselect_all();
  this.node.select_path(path);
  this.node.set_cursor(path, null, false);
  this._cursor = rowIndex;

  this.shouldReactToCursorChanges = true;
};

/**
 * @param {(ev: { index: number, mouseEvent: MouseEvent }) => void} callback
 */
ListGrid.prototype.setCursorCallback = function(callback) {
  this.setCursorCallback = noop;

  this.node.connect("selection-changed", () => {
    if (!this.shouldReactToCursorChanges) {
      return;
    }

    const cursor = this.node.get_cursor();

    if (cursor && cursor[1]) {
      const mouseEvent = this.mouseEvent;
      this.mouseEvent = undefined;

      const path = /** @type {TreePath} */ (cursor[1]);
      const index = path.get_indices()[0];

      callback({ index, mouseEvent });
    }
  });
};

/**
 * @param {number} dragAction
 */
ListGrid.prototype.setDragAction = function(dragAction) {
  this.node.enable_model_drag_source(ModifierType.BUTTON1_MASK, [], dragAction);
  this.node.drag_source_add_uri_targets();

  this.node.enable_model_drag_dest([], dragAction);
  this.node.drag_dest_add_uri_targets();
};

/**
 * @param {(ev: { limit: number, top: number }) => boolean} callback
 */
ListGrid.prototype.setKeyPressEventCallback = function(callback) {
  this.setKeyPressEventCallback = noop;

  new KeyListener(this).on("key-press-event", (ev) => {
    const visible = this.node.get_visible_range();
    const path = /** @type {TreePath} */ visible[1];
    const top = path ? path.get_indices()[0] : 0;

    const cursor = TreePath.new_from_string(String(this._cursor));
    const rect = this.node.get_cell_rect(cursor, null);
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
 * @param {(node: ListGrid) => void} callback
 */
ListGrid.prototype.setLayoutCallback = function(callback) {
  this.setLayoutCallback = noop;

  this.node.connect("size-allocate", () => {
    this.limit = 15;
    // FIXME
    // const rowHeight = this.node.get_background_area(TreePath.new_from_string("0"), null).height;
    // const height = this.node.get_visible_rect().height;
    // this.limit = Number((height / rowHeight).toFixed(2));
    callback(this);
  });
};

ListGrid.prototype.useNodeAsThis = function() {
  this._cursor = 0;
  this.limit = 0;
  this.node = /** @type {any} */ (this);
  this.shouldReactToCursorChanges = true;

  autoBind(this, ListGrid.prototype, __filename);

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

  this.node.connect("button-press-event", (_, ev) => {
    this.mouseEvent = ev;
  });
};

exports.ListGrid = ListGrid;
