import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import Store from './store'
import './index.css'

const StoreInstance = Store()

function render (Component) {
  ReactDOM.render(
    <Provider store={StoreInstance}>
      <Component />
    </Provider>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    render(NextApp)
  })
}
