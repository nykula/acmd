const assign = require('lodash/assign')

exports.initialState = {
  active: 0
}

exports.default = (_state, action) => {
  const state = _state || exports.initialState

  switch (action.type) {
    case 'TOGGLED_ACTIVE':
      const __state = assign({}, state)
      __state.active = state.active === 0 ? 1 : 0
      return __state

    default:
      return state
  }
}
