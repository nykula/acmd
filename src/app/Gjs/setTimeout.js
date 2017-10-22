const GLib = imports.gi.GLib

function setTimeout (callback, duration) {
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration, callback)
}

exports.setTimeout = setTimeout
