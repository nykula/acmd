const { extendObservable, when } = require("mobx");
const { setValue } = require("../ListStore/ListStore");

/**
 * @typedef GtkListStore
 * @property {() => any} append
 * @property {any[]} cols Non-standard property.
 * @property {(iter: any, column: number, value: any) => void} set_value
 */

/**
 * @param {any} node The domified gtk node to patch.
 */
function TableRow(node) {
  node.removeAttribute = this.set.bind(node);
  node.setAttribute = this.set.bind(node);

  extendObservable(node, {
    iter: undefined,
    store: undefined,
  });

  return node;
}

/** @type {any} */
TableRow.prototype.iter = undefined;

/** @type {GtkListStore} */
TableRow.prototype.store = undefined;

/**
 * Sets value for own column. Waits for store if not available.
 *
 * @param {string} name
 * @param {any=} value
 */
TableRow.prototype.set = function(name, value) {
  when(() => !!this.store, () => {
    if (!this.iter) {
      this.iter = this.store.append();
    }

    setValue(this.store, this.iter, name, value);
  });
};

exports.TableRow = TableRow;
