const { Box, Button, Label, ReliefStyle, VSeparator } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const PlacePopover = require("./PlacePopover").default;
const { PlaceService } = require("./PlaceService");
const PlaceToggle = require("./PlaceToggle").default;

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class Place extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, Place.prototype, __filename);
  }

  handleLevelUp() {
    const { levelUp } =
      /** @type {PanelService} */ (this.props.panelService);

    levelUp(this.props.panelId);
  }

  handleRoot() {
    const { root } =
      /** @type {PanelService} */ (this.props.panelService);

    root(this.props.panelId);
  }

  /**
   * @param {Button | null} button
   */
  refLevelUp(button) {
    if (button) {
      button.connect("clicked", this.handleLevelUp);
    }
  }

  /**
   * @param {Button | null} button
   */
  refRoot(button) {
    if (button) {
      button.connect("clicked", this.handleRoot);
    }
  }

  render() {
    const { getActivePlace } =
      /** @type {PanelService} */ (this.props.panelService);

    const { status } =
      /** @type {PlaceService} */ (this.props.placeService);

    const activePlace = getActivePlace(this.props.panelId);

    return (
      h(Box, { expand: false }, [
        h(Box, [
          h(PlaceToggle, { panelId: this.props.panelId }),
          h(PlacePopover, { panelId: this.props.panelId }),
        ]),

        h(Box, { border_width: 4, expand: true }, [
          h(Label, { label: status(activePlace) }),
        ]),

        h(VSeparator),

        h(Box, [
          h(Button, {
            can_focus: false,
            ref: this.refRoot,
            relief: ReliefStyle.NONE,
          }, [
              h(Label, { label: "\\" }),
            ]),

          h(Button, {
            can_focus: false,
            ref: this.refLevelUp,
            relief: ReliefStyle.NONE,
          }, [
              h(Label, { label: ".." }),
            ]),
        ]),
      ])
    );
  }
}

exports.Place = Place;
exports.default = connect(["panelService", "placeService"])(Place);
