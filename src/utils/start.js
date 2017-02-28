#!/usr/bin/gjs
/* global imports */
/* eslint-disable no-new-func */
// Sets up the environment and runs the application.

const Gio = imports.gi.Gio
const path = /^.*?@(.*):/.exec(new Error().stack)[1]
const dirname = Gio.File.new_for_path(path).get_parent().get_parent().get_parent().get_path()
imports.searchPath.push(dirname)
imports.src.utils.require.require()

imports.gi.Gtk.init(null)
require('./GtkDom').require()
require('..')
