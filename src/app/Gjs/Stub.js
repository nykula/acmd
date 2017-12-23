const { TreeIter } = imports.gi.Gtk;

/**
 * @param {any=} node
 */
function Stub(node) {
  if (node) {
    Stub.call(node);
    node.appendChild = this.appendChild;
    return node;
  }

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

/**
 * @type {any[]}
 */
Stub.prototype.children = undefined;

/**
 * @type {TreeIter | undefined}
 */
Stub.prototype.iter = undefined;

/**
 * @param {any} newChild
 */
Stub.prototype.appendChild = function(newChild) {
  newChild.parentNode = this;
  this.children.push(newChild);
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
