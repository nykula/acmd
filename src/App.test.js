/* global it */

const noop = require('lodash/noop')
const App = require('./App')
const Store = require('./Store').default

it('renders virtual dom without crashing', () => {
  const win = { destroy: noop }
  const store = Store(undefined, {
    GLib: {},
    Gio: {},
    Gtk: {},
    win: win,
    nextTick: noop
  })
  App.render(store)
})
