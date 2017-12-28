const { Event, Gravity } = imports.gi.Gdk;
const {
  Box,
  Button,
  IconSize,
  Image,
  Label,
  Popover,
  ReliefStyle,
} = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const Nullthrows = require("nullthrows").default;
const { Place } = require("../../domain/Place/Place");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { MouseEvent } = require("../Mouse/MouseEvent");
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {Place} place
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class PlaceEntry extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlaceEntry.prototype, __filename);

    /**
     * @type {Button | null}
     */
    this.button = null;
  }

  menu() {
    const { menus, select } = Nullthrows(this.props.placeService);
    const menu = Nullthrows(menus[this.props.panelId]);

    select(this.props.place);

    menu.popup_at_widget(
      Nullthrows(this.button),
      Gravity.CENTER,
      Gravity.STATIC,
      null,
    );
  }

  /**
   * @param {Button | null} button
   */
  ref(button) {
    if (!button) {
      return;
    }

    this.button = button;

    button.connect("clicked", () => {
      const { openPlace } = Nullthrows(this.props.panelService);
      const { popovers } = Nullthrows(this.props.placeService);
      const popover = Nullthrows(popovers[this.props.panelId]);

      openPlace(this.props.panelId, this.props.place);
      popover.hide();
    });

    if (this.props.menuCallback) {
      MouseEvent.connectMenu(button, this.props.menuCallback);
    }

    button.connect("popup-menu", this.menu);
  }

  render() {
    const { place } = this.props;
    const { status } =
      /** @type {PlaceService} */ (this.props.placeService);

    return (
      h(Button, {
        ref: this.ref,
        relief: ReliefStyle.NONE,
        tooltip_text: status(place),
      }, [
        h(Box, { spacing: 4 }, [
          h(Image, {
            gicon: GioIcon.get(place),
            icon_size: IconSize.SMALL_TOOLBAR,
          }),

          h(Label, { label: place.name }),
        ]),
      ])
    );
  }
}

exports.PlaceEntry = PlaceEntry;
exports.default = connect(["panelService", "placeService"])(PlaceEntry);
