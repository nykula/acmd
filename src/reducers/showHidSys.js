const actions = require('../actions')

const initialState = false

exports.default = (state, payload) => {
  state = state || initialState

  switch (payload.type) {
    case actions.SHOW_HID_SYS:
      return !state

    default:
      return state
  }
}
