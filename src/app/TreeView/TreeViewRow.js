const noop = require("lodash/noop");
const { extendObservable, when } = require("mobx");
const { setValue } = require("../ListStore/ListStore");

/**
 * @typedef GtkListStore
 * @property {() => any} append
 * @property {any[]} cols Non-standard property.
 * @property {(iter: any, column: number, value: any) => void} set_value
 */

function TreeViewRow() {}

/** @type {any} */
TreeViewRow.prototype.iter = undefined;

/** @type {any} */
TreeViewRow.prototype.parentNode = undefined;

/**
 * Stores initial values until TreeView uses them and redefines it.
 *
 * @param {string} name
 * @param {any=} value
 */
TreeViewRow.prototype.setAttribute = function(name, value) {
  this[name] = value;
};

/**
 * @type {(input: string) => boolean}
 */
TreeViewRow.prototype.shouldSearchSkip = noop;

exports.TreeViewRow = TreeViewRow;
