/* eslint-env jest */

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import Store from './store'

it('renders without crashing', () => {
  const StoreInstance = Store()
  ReactDOM.render(
    <Provider store={StoreInstance}>
      <App />
    </Provider>,
    document.createElement('div')
  )
})
