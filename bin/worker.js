#!/usr/bin/gjs
// Runs a task in a separate process.

const path = String(new Error().stack).replace(/^.*?@(.*):[\s\S]*/, "$1");
const dirname = imports.gi.Gio.File.new_for_path(path).resolve_relative_path("../..").get_path();
imports.searchPath.push(dirname);
new imports.src.app.Gjs.Require.Require().require();
new imports.src.app.Gjs.GtkDom.GtkDom().require();

const { Worker } = require("../src/app/Gio/Worker");
const worker = new Worker(JSON.parse(ARGV[0]), (action) => {
  print(JSON.stringify(action));
});
worker.run();
