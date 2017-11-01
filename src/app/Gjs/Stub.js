function Stub() {
  this.children = [];

  Object.defineProperties(this, {
    firstChild: { configurable: true, get: () => this.children[0] },
  });
}

/**
 * @type {any[]}
 */
Stub.prototype.children = undefined;

/**
 * @param {any} newChild
 */
Stub.prototype.appendChild = function(newChild) {
  this.children.push(newChild);
};

/**
 * Stores initial values until parent (your component) uses them and redefines it.
 *
 * @param {string} name
 * @param {any=} value
 */
Stub.prototype.setAttribute = function(name, value) {
  this[name] = value;
};

exports.Stub = Stub;
