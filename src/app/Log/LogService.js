function LogService () {}

/**
 * @param {string} label
 * @param {any} value
 */
LogService.prototype.log = function (label, value) {
  console.log(`${label} ${JSON.stringify(value)})`)
}

exports.LogService = LogService
