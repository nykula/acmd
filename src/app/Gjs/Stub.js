const { TreeIter } = imports.gi.Gtk;
const { noop } = require("lodash");

/**
 * @param {any=} node
 */
function Stub(node) {
  if (node) {
    Stub.call(node);
    node.appendChild = this.appendChild;
    return node;
  }

  /** @type {any[]} */
  this.children = [];

  Object.defineProperties(this, {
    firstChild: {
      get: () =>
        this.children[0] ||
        // Inferno tests for null, not undefined.
        null,
    },
  });
}

// Work around error TS6133 "declared but its value is never read".
noop(TreeIter);

/**
 * @type {TreeIter | undefined}
 */
Stub.prototype.iter = undefined;

/**
 * @param {any} newChild
 */
Stub.prototype.appendChild = function(newChild) {
  newChild.parentNode = this;
  (/** @type {any[]} */ (this.children)).push(newChild);
};

/**
 * Stores initial values until parent (your component) uses them and redefines it.
 *
 * @param {string} name
 * @param {any=} value
 */
Stub.prototype.setAttribute = function(name, value) {
  /** @type {{ [name: string]: any }} */
  const self = this;

  self[name] = value;
};

exports.Stub = Stub;
