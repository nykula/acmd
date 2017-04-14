const { combineReducers } = require('redux/lib')
const tabs = require('./tabs').default

const rootReducer = combineReducers({
  tabs: tabs
})

exports.default = rootReducer
