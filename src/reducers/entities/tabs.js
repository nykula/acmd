const assign = require('lodash/assign')
const filesActions = require('../../actions/files')

const initialState = {
  0: {
    cursor: 0,
    selected: []
  },
  1: {
    cursor: 0,
    selected: []
  }
}

exports.default = (state, payload) => {
  state = state || initialState

  switch (payload.type) {
    case filesActions.CURSOR: {
      state = assign({}, state)

      state[payload.tabId] = assign({}, state[payload.tabId], {
        cursor: payload.cursor
      })

      return state
    }

    case filesActions.SELECTED: {
      state = assign({}, state)

      state[payload.tabId] = assign({}, state[payload.tabId], {
        selected: payload.selected
      })

      return state
    }

    default:
      return state
  }
}
