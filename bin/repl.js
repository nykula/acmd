#!/usr/bin/gjs
// Sets up the environment and runs a Gjs shell.

const path = String(new Error().stack).replace(/^.*?@(.*):[\s\S]*/, "$1");
const dirname = imports.gi.Gio.File.new_for_path(path).resolve_relative_path("../..").get_path();
imports.searchPath.push(dirname);
new imports.src.app.Gjs.Require.Require().require();
new imports.src.app.Gjs.GtkDom.GtkDom().require();
imports.console.interact();
