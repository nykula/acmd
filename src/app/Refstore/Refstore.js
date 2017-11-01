const { autoBind } = require("../Gjs/autoBind");

function Refstore() {
  autoBind(this, Refstore.prototype, __filename);

  /**
   * @type {{ [key: string]: any }}
   */
  this.refs = {};

  /**
   * @type {{ [key: string]: ((node: any) => void) }}
   */
  this.setters = {};
}

/**
 * @param {string} key
 */
Refstore.prototype.get = function(key) {
  return this.refs[key];
};

/**
 * @param {string} key
 */
Refstore.prototype.set = function(key) {
  if (!this.setters[key]) {
    this.setters[key] = node => {
      this.refs[key] = node;
    };
  }

  return this.setters[key];
};

exports.default = Refstore;
