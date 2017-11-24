#!/usr/bin/gjs
// Sets up the environment and runs the application.

const path = /^.*?@(.*):/.exec(new Error().stack)[1];
const dirname = imports.gi.Gio.File.new_for_path(path).get_parent().get_parent().get_path();
imports.searchPath.push(dirname);
new imports.src.app.Gjs.Require.Require().require();
new imports.src.app.Gjs.GtkDom.GtkDom().require();
require("../src/app");
