const { Box, HSeparator, Orientation, Popover } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const PlaceEntry = require("./PlaceEntry").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class PlacePopover extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlacePopover.prototype, __filename);
  }

  /**
   * @param {Popover | null} popover
   */
  ref(popover) {
    if (!popover) {
      return;
    }

    const { popovers, toggles } =
      /** @type {PlaceService} */ (this.props.placeService);

    popover.set_relative_to(toggles[this.props.panelId]);
    popovers[this.props.panelId] = popover;

    popover.connect("show", () => {
      const { getActivePlace } =
        /** @type {PanelService} */ (this.props.panelService);

      const { places } =
        /** @type {PlaceService} */ (this.props.placeService);

      const place = getActivePlace(this.props.panelId);
      const index = places.indexOf(place);

      const box = /** @type {Box} */ (popover.get_children()[0]);
      box.get_children()[index].grab_focus();
    });
  }

  render() {
    const {
      places,
      specials,
      trash,
    } = /** @type {PlaceService} */ (this.props.placeService);

    let children = places.map(place =>
      h(PlaceEntry, {
        panelId: this.props.panelId,
        place,
      }),
    );

    const more = specials.concat(trash || []).map(place =>
      h(PlaceEntry, {
        panelId: this.props.panelId,
        place,
      }),
    );

    if (more.length) {
      children = children.concat(h(HSeparator)).concat(more);
    }

    return (
      h("stub-box", [
        h(Popover, { ref: this.ref }, [
          h(Box, { orientation: Orientation.VERTICAL }, children),
        ]),
      ])
    );
  }
}

exports.PlacePopover = PlacePopover;
exports.default = inject("panelService", "placeService")(observer(PlacePopover));
