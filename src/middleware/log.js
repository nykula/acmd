const { CURSOR, SELECTED } = require('../actions/files')
const { DRIVES, LS } = require('../actions')

/* global print */
exports.default = store => next => action => {
  if ([CURSOR, DRIVES, LS, SELECTED].indexOf(action.type) === -1) {
    print(JSON.stringify(action))
  }

  return next(action)
}
