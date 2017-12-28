const { Gravity } = imports.gi.Gdk;
const { Box, Button, IconSize, Image, Label, ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const Nullthrows = require("nullthrows").default;
const { Place } = require("../../domain/Place/Place");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {Place} place
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class PlacesEntry extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlacesEntry.prototype, __filename);
  }

  isActive() {
    const { getActivePlace } =
      /** @type {PanelService} */ (this.props.panelService);

    const place = getActivePlace(this.props.panelId);

    return place === this.props.place;
  }

  /**
   * @param {Button} button
   */
  menu(button) {
    const { menus, select } = Nullthrows(this.props.placeService);
    const menu = Nullthrows(menus[this.props.panelId]);

    select(this.props.place);

    menu.popup_at_widget(
      button,
      Gravity.CENTER,
      Gravity.STATIC,
      null,
    );
  }

  open() {
    const { openPlace } = Nullthrows(this.props.panelService);
    openPlace(this.props.panelId, this.props.place);
  }

  render() {
    const { shortNames, status } =
      /** @type {PlaceService} */ (this.props.placeService);

    const { icon, iconType, name } = this.props.place;

    return h(ToggleButton, {
      active: this.isActive(),
      can_focus: false,
      menuCallback: this.menu,
      pressedCallback: this.open,
      relief: ReliefStyle.NONE,
      tooltip_text: status(this.props.place),
    }, [
        h(Box, { spacing: 4 }, [
          h(Image, {
            gicon: GioIcon.get({ icon: icon, iconType: iconType }),
            icon_size: IconSize.SMALL_TOOLBAR,
          }),
          h(Label, { label: shortNames[name] }),
        ]),
      ]);
  }
}

exports.PlacesEntry = PlacesEntry;
exports.default = connect(["panelService", "placeService"])(PlacesEntry);
