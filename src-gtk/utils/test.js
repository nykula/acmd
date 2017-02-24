#!/usr/bin/gjs
/* global imports */
/* eslint-disable no-new-func */
// Sets up the environment and runs the smoke tests.

const __file = imports.gi.Gio.file_new_for_path(
  Error().stack.replace(/.*?@(.+):\d+.*/, '$1')
)

new Function('imports', '__filename',
  String(imports.gi.GLib.file_get_contents(
    __file.get_parent().get_child('require.js').get_path()
  )[1])
)(imports, __file.get_path())

const Gtk = imports.gi.Gtk
require('./GtkDom').require()
const { create } = require('virtual-dom')

/**
 * Renders a tree and inserts it into a one-off application.
 */
window.smoke = function (tree) {
  require('./GtkDom').app({
    on_startup: ({ app, win }) => {
      win.add(create(tree))
    },

    on_activate: ({ win }) => {
      win.show_all()
      win.destroy()
    }
  }).run([])
}

Gtk.init(null)
require('../test')
