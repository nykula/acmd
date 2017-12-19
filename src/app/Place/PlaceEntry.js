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
const { Place } = require("../../domain/Place/Place");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
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
  }

  /**
   * @param {Button | null} button
   */
  ref(button) {
    if (!button) {
      return;
    }

    button.connect("clicked", () => {
      if (!this.props.place.rootUri) {
        return;
      }

      const { ls, setActive } =
        /** @type {PanelService} */ (this.props.panelService);

      const { popovers } =
        /** @type {PlaceService} */ (this.props.placeService);

      const popover =
      /** @type {Popover} */ (popovers[this.props.panelId]);

      ls(this.props.place.rootUri, this.props.panelId);
      setActive(this.props.panelId);
      popover.hide();
    });
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
