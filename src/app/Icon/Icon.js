/* global imports */
const Gio = imports.gi.Gio

/**
 * Deserializes a Gio icon reference.
 */
exports.default = ({ icon, iconType }) => {
  return iconType === 'ICON_NAME'
    ? Gio.ThemedIcon.new_from_names([icon])
    : Gio.Icon.new_for_string(icon)
}
