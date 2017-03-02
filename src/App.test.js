/* global it, smoke */

const noop = require('lodash/noop')
const App = require('./App')
const Panel = require('./components/Panel')
const Store = require('./Store').default

Panel.syncFocus = noop
Panel.syncSelection = noop

it('renders without crashing', () => {
  const win = { destroy: noop }
  const store = Store(undefined, {
    GLib: {},
    Gio: {},
    Gtk: {},
    win: win,
    nextTick: noop
  })

  smoke(App.render(store))
})
