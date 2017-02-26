/* global imports, ARGV */
// Runs the application.

const Gdk = imports.gi.Gdk
const Gtk = imports.gi.Gtk
const Store = require('./Store').default
const panelsActions = require('./actions/panels')
const { create, diff, patch } = require('virtual-dom')

const pressedKeys = {}

require('./utils/GtkDom').app({
  on_activate: ({win}) => {
    win.set_keep_above(true)
  },

  on_startup: ({ win }) => {
    win.default_width = 800
    win.default_height = 600
    win.window_position = Gtk.WindowPosition.CENTER

    const store = Store(undefined, win)
    let render = require('./App').render
    let tree = render(store)
    let rootNode = create(tree)
    win.add(rootNode)

    store.subscribe(() => {
      const newTree = render(store)
      const patches = diff(tree, newTree)
      rootNode = patch(rootNode, patches)
    })

    win.connect('key-press-event', (_, ev) => {
      const keyval = ev.get_keyval()[1]
      pressedKeys[keyval] = true
    })

    win.connect('key-release-event', (_, ev) => {
      const keyval = ev.get_keyval()[1]

      if (pressedKeys[Gdk.KEY_Control_L] && pressedKeys[Gdk.KEY_Shift_L] && pressedKeys[Gdk.KEY_R]) {
        Object.keys(require.cache).forEach(x => {
          delete require.cache[x]
        })
        rootNode.destroy()
        render = require('./App').render
        tree = render(store)
        rootNode = create(tree)
        win.add(rootNode)
        rootNode.show()
      } else if (pressedKeys[Gdk.KEY_Tab]) {
        store.dispatch(panelsActions.toggledActive())
      }

      pressedKeys[keyval] = false
    })

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
