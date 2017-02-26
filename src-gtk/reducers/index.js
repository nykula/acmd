const { combineReducers } = require('redux/lib')
const files = require('./files').default
const locations = require('./locations').default
const panels = require('./panels').default
const tabs = require('./tabs').default
const volumes = require('./volumes').default

const rootReducer = combineReducers({
  files: files,
  locations: locations,
  panels: panels,
  tabs: tabs,
  volumes: volumes
})

exports.default = (_state, payload) => {
  const state = rootReducer(_state, payload)
  return state
}
