const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const autoBind = require("../Gjs/autoBind").default;
const { setValue } = require("../ListStore/ListStore");
const { TreeViewRow } = require("./TreeViewRow");

function Col() {
  this.name = "";
  this.type = "";
}

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
 * @typedef IProps
 * @property {any[]} children
 *
 * @param {IProps} props
 */
function TreeViewBody(props) {
  Component.call(this, props);
  autoBind(this, TreeViewBody.prototype, __filename);
}

TreeViewBody.prototype = Object.create(Component.prototype);

/** @type {IProps} */
TreeViewBody.prototype.props = undefined;

/** @type {TreeViewRow[]} */
TreeViewBody.prototype.rows = undefined;

/** @type {GtkListStore} */
TreeViewBody.prototype._store = undefined;

/**
 * @param {TreeViewRow} row
 */
TreeViewBody.prototype.ensureInit = function(row) {
  if (row.iter) {
    return;
  }

  Object.defineProperties(row, {
    nextSibling: {
      get: () => this.rows[this.rows.indexOf(row) + 1],
    },
  });

  row.iter = this._store.append();
  row.parentNode = this;

  const setAttribute = (name, value) => {
    setValue(this._store, row.iter, name, value);
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
TreeViewBody.prototype.insertBefore = function(newChild, existingChild) {
  this.ensureInit(newChild);
  this._store.move_before(newChild.iter, existingChild ? existingChild.iter : null);
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
TreeViewBody.prototype.appendChild = function(newChild) {
  if (this._store) {
    this.insertBefore(newChild);
  } else {
    this.rows.push(newChild);
  }
};

/**
 * @param {TreeViewRow} row
 */
TreeViewBody.prototype.removeChild = function(row) {
  this._store.remove(row.iter);
  this.rows.splice(this.rows.indexOf(row), 1);
  return row;
};

/**
 * @param {TreeViewRow} newChild
 * @param {TreeViewRow} oldChild
 */
TreeViewBody.prototype.replaceChild = function(newChild, oldChild) {
  this.insertBefore(newChild, oldChild);
  return this.removeChild(oldChild);
};

TreeViewBody.prototype.clear = function() {
  this._store.clear();
  this.rows.splice(0);
};

/**
 * @param {GtkListStore} store
 */
TreeViewBody.prototype.setStore = function(store) {
  this._store = store;

  for (const row of this.rows) {
    this.ensureInit(row);
  }
};

TreeViewBody.prototype.ref = function(node) {
  this.rows = node.children;

  node.appendChild = this.appendChild;
  node.insertBefore = this.insertBefore;
  node.removeChild = this.removeChild;
  node.replaceChild = this.replaceChild;

  Object.defineProperties(node, {
    firstChild: { get: () => this.rows[0] },
    store: {
      get: () => this._store,
      set: this.setStore,
    },
    textContent: { set: () => this.clear() },
  });
};

TreeViewBody.prototype.render = function() {
  return h("stub", { ref: this.ref }, this.props.children);
};

exports.TreeViewBody = TreeViewBody;
