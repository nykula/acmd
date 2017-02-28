/* global imports, ARGV */
// Runs the application.

const Gdk = imports.gi.Gdk
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const actions = require('./actions')
const Dialog = require('./utils/Dialog').default
const Store = require('./Store').default
const { create, diff, patch } = require('virtual-dom')

require('./utils/GtkDom').app({
  on_activate: ({win}) => {
    win.set_keep_above(true)
  },

  on_startup: ({ win }) => {
    win.default_width = 800
    win.default_height = 600
    win.window_position = Gtk.WindowPosition.CENTER

    const store = Store(undefined, {
      Dialog: Dialog({ Gtk: Gtk, win: win }),
      Gdk: Gdk,
      Gio: Gio,
      GLib: GLib,
      Gtk: Gtk,
      win: win,
      nextTick: (callback) => {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
          callback()
        })
      }
    })

    let render = require('./App').render
    let tree = render(store)
    let rootNode = create(tree)
    win.add(rootNode)

    let state
    store.subscribe(() => {
      const newState = store.getState()
      if (newState !== state) {
        const newTree = render(store)
        const patches = diff(tree, newTree)
        rootNode = patch(rootNode, patches)
        state = newState
        tree = newTree
      }
    })

    store.dispatch(actions.refresh())

    if (module.hot) {
      module.hot.accept('./App', () => {
        render = require('./App').render
        const newTree = render(store)
        const patches = diff(tree, newTree)
        rootNode = patch(rootNode, patches)
        tree = newTree
      })
    }
  }
}).run(ARGV)
