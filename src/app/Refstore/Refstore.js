function Refstore() {
  this.get = this.get.bind(this);
  this.set = this.set.bind(this);

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
