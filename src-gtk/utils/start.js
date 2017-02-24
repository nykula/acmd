#!/usr/bin/gjs
/* global imports */
/* eslint-disable no-new-func */
// Sets up the environment and runs the application.

const __file = imports.gi.Gio.file_new_for_path(
  Error().stack.replace(/.*?@(.+):\d+.*/, '$1')
)

new Function('imports', '__filename',
  String(imports.gi.GLib.file_get_contents(
    __file.get_parent().get_child('require.js').get_path()
  )[1])
)(imports, __file.get_path())

require('./GtkDom').require()
require('..')
