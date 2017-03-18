const { applyMiddleware, createStore } = require('redux/lib')
const destroy = require('./middleware/destroy').default
const index = require('./middleware').default
const keyboard = require('./middleware/keyboard').default
const log = require('./middleware/log').default
const rootReducer = require('./reducers').default

exports.default = (initialState, extra) => {
  const enhancer = applyMiddleware(
    log,
    destroy(extra),
    keyboard(extra),
    index(extra)
  )
  const store = createStore(rootReducer, initialState, enhancer)
  return store
}
