const actions = require('../actions/locations')
const assign = require('lodash/assign')

exports.initialState = {
  0: 'file:///',
  1: 'file:///'
}

exports.default = (_state, payload) => {
  const state = _state || exports.initialState

  switch (payload.type) {
    case actions.LS: {
      let __state = assign({}, state)
      __state[payload.panel] = payload.uri
      return __state
    }

    default:
      return state
  }
}
