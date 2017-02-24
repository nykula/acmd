/* global imports, ARGV */
// Runs the application after index.js has initialized the environment.

const Gtk = imports.gi.Gtk
const { create, diff, patch } = require('virtual-dom')

require('./utils/GtkDom').app({
  on_startup: ({ win }) => {
    const handleDestroy = () => { win.destroy() }

    win.border_width = 20
    win.window_position = Gtk.WindowPosition.CENTER

    let render = require('./App').render
    let tree = render({ onDestroy: handleDestroy })
    let rootNode = create(tree)
    win.add(rootNode)

    if (module.hot) {
      module.hot.accept('./App', () => {
        render = require('./App').render
        const newTree = render({ onDestroy: handleDestroy })
        const patches = diff(tree, newTree)
        rootNode = patch(rootNode, patches)
        tree = newTree
      })
    }
  }
}).run(ARGV)
