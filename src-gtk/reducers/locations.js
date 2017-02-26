const actions = require('../actions/locations')
const assign = require('lodash/assign')

exports.initialState = {
  0: '/',
  1: '/'
}

exports.default = (_state, payload) => {
  const state = _state || exports.initialState

  switch (payload.type) {
    case actions.LS: {
      let __state = assign({}, state)
      __state[payload.panel] = payload.path
      return __state
    }

    default:
      return state
  }
}
