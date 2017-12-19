const { Box, Button, IconSize, Image, Label, Popover } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
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

    const { toggles } =
      /** @type {PlaceService} */ (this.props.placeService);

    toggles[this.props.panelId] = button;

    button.connect("clicked", () => {
      const { popovers } =
        /** @type {PlaceService} */ (this.props.placeService);

      const popover =
        /** @type {Popover} */ (popovers[this.props.panelId]);

      popover.show_all();
    });
  }

  render() {
    const { getActivePlace } =
      /** @type {PanelService} */ (this.props.panelService);

    const { shortNames } =
      /** @type {PlaceService} */ (this.props.placeService);

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
