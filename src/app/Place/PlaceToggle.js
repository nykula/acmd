const { Gravity } = imports.gi.Gdk;
const { Box, Button, IconSize, Image, Label, Popover } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const Nullthrows = require("nullthrows").default;
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { MouseEvent } = require("../Mouse/MouseEvent");
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class PlaceToggle extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlaceToggle.prototype, __filename);
  }

  /**
   * @param {Button | null} button
   */
  ref(button) {
    if (!button) {
      return;
    }

    const { toggles } = Nullthrows(this.props.placeService);
    toggles[this.props.panelId] = button;

    button.connect("clicked", () => {
      const { popovers } = Nullthrows(this.props.placeService);
      const popover = Nullthrows(popovers[this.props.panelId]);

      popover.show_all();
    });

    MouseEvent.connectMenu(button, () => {
      const { getActivePlace } = Nullthrows(this.props.panelService);
      const { menus, select } = Nullthrows(this.props.placeService);
      const menu = Nullthrows(menus[this.props.panelId]);

      select(getActivePlace(this.props.panelId));

      menu.popup_at_widget(
        button,
        Gravity.CENTER,
        Gravity.STATIC,
        null,
      );
    });
  }

  render() {
    const { getActivePlace } = Nullthrows(this.props.panelService);
    const { shortNames } = Nullthrows(this.props.placeService);
    const activePlace = getActivePlace(this.props.panelId);

    return (
      h(Button, {
        can_focus: false,
        ref: this.ref,
      }, [
          h(Box, { spacing: 4 }, [
            h(Image, {
              gicon: GioIcon.get(activePlace),
              icon_size: IconSize.SMALL_TOOLBAR,
            }),

            h(Label, { label: shortNames[activePlace.name] }),

            h(Image, {
              icon_name: "pan-down-symbolic",
              icon_size: IconSize.SMALL_TOOLBAR,
            }),
          ]),
        ])
    );
  }
}

exports.PlaceToggle = PlaceToggle;
exports.default = connect(["panelService", "placeService"])(PlaceToggle);
