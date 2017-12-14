const { Icon, ThemedIcon } = imports.gi.Gio;

class GioIcon {
  /**
   * Deserializes a Gio icon reference.
   *
   * @param {{ icon: string, iconType: string }} props
   */
  static get(props) {
    return props.iconType === "ICON_NAME"
      ? ThemedIcon.new_from_names([props.icon])
      : Icon.new_for_string(props.icon);
  }

  /**
   * @param {Icon} icon
   */
  static stringify(icon) {
    return icon ? icon.to_string() : null;
  }
}

exports.GioIcon = GioIcon;
