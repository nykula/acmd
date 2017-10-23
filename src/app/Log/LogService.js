function LogService(debug = console.log.bind(console)) {
  this.debug = debug;
  this.log = this.log.bind(this);
}

/**
 * @param {string} label
 * @param {any} value
 */
LogService.prototype.log = function(label, value) {
  this.debug(`${label}: ${JSON.stringify(value)}`);
};

exports.LogService = LogService;
