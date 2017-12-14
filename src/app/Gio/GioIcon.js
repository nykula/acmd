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
}

exports.GioIcon = GioIcon;
