#!/usr/bin/gjs
/* global imports */
// Sets up the environment and runs a Gjs shell.

const path = /^.*?@(.*):/.exec(new Error().stack)[1]
const dirname = imports.gi.Gio.File.new_for_path(path).get_parent().get_parent().get_path()
imports.searchPath.push(dirname)
imports.src.app.Gjs.require.require()

imports.gi.Gtk.init(null)
require('../src/app/Gjs/GtkDom').require()
imports.console.interact()
