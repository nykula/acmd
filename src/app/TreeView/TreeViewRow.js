const noop = require("lodash/noop");
const { extendObservable, when } = require("mobx");
const { setValue } = require("../ListStore/ListStore");

/**
 * @typedef GtkListStore
 * @property {() => any} append
 * @property {any[]} cols Non-standard property.
 * @property {(iter: any, column: number, value: any) => void} set_value
 */

function TreeViewRow() {
  this.removeAttribute = this.set.bind(this);
  this.setAttribute = this.set.bind(this);

  extendObservable(this, {
    iter: undefined,
    store: undefined,
  });
}

/** @type {any} */
TreeViewRow.prototype.iter = undefined;

/** @type {GtkListStore} */
TreeViewRow.prototype.store = undefined;

/**
 * Sets value for own column. Waits for store if not available.
 *
 * @param {string} name
 * @param {any=} value
 */
TreeViewRow.prototype.set = function(name, value) {
  when(() => !!this.store, () => {
    if (!this.iter) {
      this.iter = this.store.append();
    }

    setValue(this.store, this.iter, name, value);
  });
};

/**
 * @type {(input: string) => boolean}
 */
TreeViewRow.prototype.shouldSearchSkip = noop;

exports.TreeViewRow = TreeViewRow;
