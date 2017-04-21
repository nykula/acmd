const { DRIVES, LS } = require('../actions')

/* global print */
exports.default = store => next => action => {
  if (action.type !== DRIVES && action.type !== LS) {
    print(JSON.stringify(action))
  }

  return next(action)
}
