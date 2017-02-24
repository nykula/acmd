/* global imports */
const camelCase = require('lodash/camelCase')
const upperFirst = require('lodash/upperFirst')

/**
 * Monkey-patches a GTK+ widget to resemble a DOM node.
 */
exports.domify = function (document, node) {
  node.appendChild = function (node) {
    this.add(node)

    Object.keys(node).filter(x => /^on_/.test(x)).forEach(x => {
      const signal = x.slice(3)
      node.connect(signal, node[x])
    })

    node.show()
  }

  node.removeChild = function (node) {
    this.remove(node)
  }

  Object.defineProperty(node, 'childNodes', {
    get: function () {
      try {
        return this.get_children()
      } catch (err) {
        // Is not a box
        return []
      }
    }
  })

  Object.defineProperty(node, 'children', {
    get: function () {
      try {
        return this.get_children()
      } catch (err) {
        // Is not a box
        return []
      }
    }
  })

  Object.defineProperty(node, 'parentNode', {
    get: function () { return this.parent }
  })

  node.insertBefore = function (newChild, existingChild) {
    var children = this.get_children()

    if (existingChild) {
      var repack = children.slice(children.indexOf(existingChild))
      this.add(newChild)

      for (var i = 0; i < repack.length; i++) {
        this.remove(repack[i])
        this.pack_end(repack[i], false, false, 0)
      }
    } else {
      this.add(newChild)
    }
  }

  node.replaceChild = function (newChild, oldChild) {
    this.insertBefore(newChild, oldChild)
    this.remove(oldChild)
  }

  node.ownerDocument = document

  return node
}

/**
 * Instantiates a GTK+ widget associated with a given tag name. Assigns helpers
 * for it to be compatible with virtual-dom.
 */
exports.createElement = function (Gtk, domify, tagName) {
  return domify(new Gtk[upperFirst(camelCase(tagName))]())
}

/**
 * Creates a Gtk application with a main window.
 */
exports.app = function ({ on_activate, on_startup }) {
  const Gtk = imports.gi.Gtk
  const app = new Gtk.Application()
  let win
  app.connect('startup', () => {
    win = new Gtk.ApplicationWindow({ application: app })
    on_startup && on_startup({ app: app, win: win })
  })
  app.connect('activate', () => {
    win.show_all()
    on_activate && on_activate({ app: app, win: win })
  })
  return app
}

/**
 * Assigns domify and createElement on window. Points document and global to
 * window. Sets process.env to an empty object. Aliases print as
 * console.error, console.log and console.warn.
 */
exports.require = function () {
  window.document = window.global = window
  window.domify = exports.domify.bind(null, window)
  window.createElement = exports.createElement.bind(null, imports.gi.Gtk, window.domify)
  window.process = { env: {} }
  window.console = { error: window.print, log: window.print, warn: window.print }
}
