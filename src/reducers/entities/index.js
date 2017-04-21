const { combineReducers } = require('redux/lib')
const panels = require('./panels').default
const tabs = require('./tabs').default

const rootReducer = combineReducers({
  panels: panels,
  tabs: tabs
})

exports.default = rootReducer
