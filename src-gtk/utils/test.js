#!/usr/bin/gjs
/* global imports */
/* eslint-disable no-new-func */
// Sets up the environment and runs the smoke tests.

const Gio = imports.gi.Gio
const path = /^.*?@(.*):/.exec(new Error().stack)[1]
const dirname = Gio.File.new_for_path(path).get_parent().get_parent().get_parent().get_path()
imports.searchPath.push(dirname)
imports['src-gtk'].utils['require'].require()

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
