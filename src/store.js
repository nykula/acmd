const { applyMiddleware, createStore } = require('redux/lib')
const destroy = require('./middleware/destroy').default
const index = require('./middleware').default
const gio = require('./middleware/gio').default
const keyboard = require('./middleware/keyboard').default
const log = require('./middleware/log').default
const rootReducer = require('./reducers').default

exports.default = (initialState, {Dialog, Gdk, Gio, GLib, Gtk, win, nextTick}) => {
  const enhancer = applyMiddleware(
    log,
    destroy(win),
    keyboard({
      Gdk: Gdk,
      win: win
    }),
    gio({
      Gio: Gio,
      GLib: GLib,
      Gtk: Gtk,
      nextTick: nextTick
    }),
    index({ Dialog: Dialog })
  )
  const store = createStore(rootReducer, initialState, enhancer)
  return store
}
