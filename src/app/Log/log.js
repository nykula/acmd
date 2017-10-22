const { CURSOR, SELECTED } = require('../File/FileAction')
const { DRIVES, LS } = require('../Action/Action')

/* global print */
exports.default = _ => next => action => {
  if ([CURSOR, DRIVES, LS, SELECTED].indexOf(action.type) === -1) {
    print(JSON.stringify(action))
  }

  return next(action)
}
