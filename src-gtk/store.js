const { applyMiddleware, createStore } = require('redux/lib')
const destroy = require('./middleware/destroy').default
const log = require('./middleware/log').default
const rootReducer = require('./reducers').default

exports.default = (initialState, win) => {
  const enhancer = applyMiddleware(
    log,
    destroy(win)
  )
  const store = createStore(rootReducer, initialState, enhancer)
  return store
}
