const autoBind = require("../Gjs/autoBind").default;

/**
 * @param {Stub} node
 */
function Stub(node) {
  this.useNodeAsThis.call(node);
  return node;
}

/**
 * @type {any[]}
 */
Stub.prototype.children = undefined;

Stub.prototype.useNodeAsThis = function() {
  this.children = [];

  autoBind(this, Stub.prototype, __filename);

  Object.defineProperties(this, {
    firstChild: { configurable: true, get: () => this.children[0] },
  });
};

/**
 * @param {any} newChild
 */
Stub.prototype.appendChild = function(newChild) {
  this.children.push(newChild);
};

exports.Stub = Stub;
