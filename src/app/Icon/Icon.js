const Gio = imports.gi.Gio;

/**
 * Deserializes a Gio icon reference.
 *
 * @param {{ icon: string, iconType: string }} props
 */
exports.default = (props) => {
  return props.iconType === "ICON_NAME"
    ? Gio.ThemedIcon.new_from_names([props.icon])
    : Gio.Icon.new_for_string(props.icon);
};
