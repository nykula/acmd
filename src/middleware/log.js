/* global print */
exports.default = store => next => action => {
  print(JSON.stringify(action, null, 2))
  return next(action)
}
