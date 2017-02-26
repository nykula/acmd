/* global smoke */

const App = require('./App')
const Store = require('./store').default

const win = { destroy: () => { } }
const store = Store(undefined, win)

smoke(App.render(store))
