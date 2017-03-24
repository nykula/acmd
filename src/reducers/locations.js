const actions = require('../actions')
const assign = require('lodash/assign')

exports.initialState = {
  0: 'file:///',
  1: 'file:///'
}

exports.default = (_state, action) => {
  const state = _state || exports.initialState

  switch (action.type) {
    case actions.LS: {
      let __state = assign({}, state)
      __state[action.tabId] = action.uri
      return __state
    }

    default:
      return state
  }
}
