import { applyMiddleware, createStore } from 'redux'
import rootReducer from './reducers'

const bridge = window => store => next => action => {
  const isRequest = !action.error && !action.progress && !action.ready
  const isResponse = !action.error && action.ready

  if (['LS', 'CP', 'MV', 'RM'].indexOf(action.type) !== -1 && isRequest) {
    window.document.title = JSON.stringify(action)
  }

  if (['CP', 'MV', 'RM'].indexOf(action.type) !== -1 && isResponse) {
    setTimeout(function () {
      const state = store.getState()

      store.dispatch({
        type: 'LS',
        panel: 0,
        path: state.locations[0]
      })

      store.dispatch({
        type: 'LS',
        panel: 1,
        path: state.locations[1]
      })
    }, 0)
  }

  return next(action)
}

export default (initialState, window) => {
  const enhancer = applyMiddleware(bridge(window))
  const store = createStore(rootReducer, initialState, enhancer)
  window.dispatch = store.dispatch.bind(store)
  return store
}
