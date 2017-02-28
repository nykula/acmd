const actions = require('../actions/panels')
const assign = require('lodash/assign')
const filesActions = require('../actions/files')

exports.initialState = {
  active: 0
}

exports.default = (_state, action) => {
  const state = _state || exports.initialState

  switch (action.type) {
    case actions.TOGGLED_ACTIVE:
      return assign({}, state, {
        active: state.active === 0 ? 1 : 0
      })

    case filesActions.CURSOR:
    case filesActions.SELECTED:
      return assign({}, state, {
        active: action.panelId
      })

    default:
      return state
  }
}
