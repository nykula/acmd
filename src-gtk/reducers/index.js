const { combineReducers } = require('redux/lib')

const rootReducer = combineReducers({
  identities: (state = []) => state
})

exports.default = (_state, payload) => {
  const state = rootReducer(_state, payload)
  return state
}
