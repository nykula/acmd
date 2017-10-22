#!/usr/bin/gjs
// Runs a task in a separate process.

const path = /^.*?@(.*):/.exec(new Error().stack)[1];
const dirname = imports.gi.Gio.File.new_for_path(path).get_parent().get_parent().get_path();
imports.searchPath.push(dirname);
imports.src.app.Gjs.require.require();

const { Worker } = require("../src/app/Gio/Worker");
const worker = new Worker();

worker.run(
  JSON.parse(ARGV[0]),
  (action) => {
    print(JSON.stringify(action));
  },
);
