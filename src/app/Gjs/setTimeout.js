const GLib = imports.gi.GLib;

/**
 * @param {() => void} callback
 * @param {number} duration
 */
function setTimeout(callback, duration) {
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration, () => {
    callback();
    return false;
  });
}

exports.setTimeout = setTimeout;
