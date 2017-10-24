const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const noop = require('lodash/noop')
const { extendObservable, when } = require("mobx");
const autoBind = require("../Gjs/autoBind").default;
const { configureColumn, setCols } = require("../ListStore/ListStore");
const { TableRow } = require("./TableRow");

function Col() {
  this.name = "";
  this.type = "";
}

/**
 * @param {any} node
 */
function Table(node) {
  node.appendChild = this.insertBefore.bind(node);
  node.insertBefore = this.insertBefore.bind(node);
  node.removeChild = this.removeChild.bind(node);
  node.replaceChild = this.replaceChild.bind(node);

  /**
   * @type {TableRow[]}
   */
  node.rows = [];

  Object.defineProperties(node, {
    cols: {
      set(value) {
        if (this.store) {
          return
        }

        const store = new Gtk.ListStore();
        setCols(store, value);

        for (let i = 0; i < store.cols.length; i++) {
          const col = store.cols[i];
          const tvCol = new Gtk.TreeViewColumn({ title: col.name });
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
      }
    },

    firstChild: {
      get() {
        return this.rows[0]
      },
    },

    on_activated: {
      set(callback) {
        node.connect('row_activated', (_, iter) => {
          const index = iter.get_indices()[0];
          callback(index);
        });
      }
    },

    text: {
      set() {
        this.store.clear();
        this.rows.splice(0);
      },
    },
  });

  extendObservable(node, {
    store: undefined,
  });

  return node;
}

/**
 * @type {TableRow[]}
 */
Table.prototype.rows = undefined;

/**
 * Native column insertion method.
 * @type {(gtkTreeViewColumn: any, columnIndex: number) => void}
 */
Table.prototype.insert_column = undefined;

/**
 * Custom row activated event handler.
 * @type {(index: number) => void}
 */
Table.prototype.on_activated = noop;

/**
 * Native model setter.
 * @type {(gtkListStore: any) => void}
 */
Table.prototype.set_model = undefined;

/**
 * @typedef GtkListStore
 * @property {Col[]} cols Non-standard property.
 * @property {(iter: any, sibling: any | null) => void} move_before
 * @property {(iter: any) => void} remove
 * @property {(types: any[]) => void} set_column_types
 *
 * @type {GtkListStore}
 */
Table.prototype.store = undefined;

/**
 * @param {TableRow} row
 */
Table.prototype.removeChild = function (row) {
  when(() => !!this.store, () => {
    this.store.remove(row.iter);
    this.rows.splice(this.rows.indexOf(row), 1);
  })
};

/**
 * @param {TableRow} newChild
 * @param {TableRow=} existingChild
 */
Table.prototype.insertBefore = function (newChild, existingChild) {
  when(() => !!this.store, () => {
    const index = this.rows.indexOf(existingChild);

    if (this.rows.indexOf(newChild) === -1) {
      newChild.store = this.store;

      Object.defineProperties(newChild, {
        nextSibling: {
          get() {
            for (let i = 1; i < this.rows.length; i++) {
              if (this.rows[i - 1] === this) {
                return this.rows[i];
              }
            }

            return null;
          },
        },

        parentNode: {
          get() {
            return this;
          },
        },
      });
    }

    when(() => !!newChild.iter, () => {
      this.store.move_before(newChild.iter, existingChild ? existingChild.iter : null);
      this.rows.splice(index, 0, newChild);
    })
  })
};

/**
 * @param {TableRow} newChild
 * @param {TableRow} oldChild
 */
Table.prototype.replaceChild = function (newChild, oldChild) {
  when(() => !!this.store, () => {
    this.insertBefore(newChild, oldChild);
    this.rows.splice(this.rows.indexOf(oldChild), 1, newChild);
  })
};

exports.Table = Table;
