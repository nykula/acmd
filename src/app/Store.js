const { applyMiddleware, createStore } = require('redux')
const destroy = require('./Destroy/destroy').default
const index = require('./Action/middleware').default
const log = require('./Log/log').default
const rootReducer = require('./Action/reducer').default

exports.default = (initialState, extra) => {
  const enhancer = applyMiddleware(
    log,
    destroy(extra),
    index(extra)
  )
  const store = createStore(rootReducer, initialState, enhancer)
  return store
}
