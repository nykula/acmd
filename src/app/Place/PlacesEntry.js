const Gtk = imports.gi.Gtk;
const { Box, Image, Label } = Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { Place } = require("../../domain/Place/Place");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const Icon = require("../Icon/Icon").default;
const minLength = require("../MinLength/minLength").default;
const { PanelService } = require("../Panel/PanelService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {Place} place
 * @property {PanelService?} [panelService]
 * @property {string} short
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

  activeUri() {
    const { getActiveMountUri } =
      /** @type {PanelService} */ (this.props.panelService);

    return getActiveMountUri(this.props.panelId);
  }

  isActive() {
    return this.props.place.rootUri === this.activeUri();
  }

  handleClicked() {
    const { getActiveTab, ls, refresh } =
      /** @type {PanelService} */ (this.props.panelService);

    const { mountUuid, unmount } =
    /** @type {PlaceService} */ (this.props.placeService);

    const { panelId, place } = this.props;
    const { location } = getActiveTab();
    const isActive = place.rootUri === this.activeUri();

    const menu = new Gtk.Menu();
    let item;

    if (place.rootUri && place.rootUri !== location) {
      item = new Gtk.MenuItem();
      item.label = "Open";
      item.connect("activate", () => {
        ls(place.rootUri, panelId);
      });
      menu.add(item);
    }

    if (place.rootUri && !isActive) {
      item = new Gtk.MenuItem();
      item.label = "Unmount";
      item.connect("activate", () => {
        unmount(place.rootUri, refresh);
      });
      menu.add(item);
    }

    if (!place.rootUri) {
      item = new Gtk.MenuItem();
      item.label = "Mount";
      item.connect("activate", () => {
        mountUuid(place.uuid, refresh);
      });
      menu.add(item);
    }

    if (!item) {
      return;
    }

    menu.show_all();
    menu.popup(null, null, null, 0, 0);
  }

  render() {
    const { place, short } = this.props;
    const { icon, iconType, name } = place;

    return h(ToggleButton, {
      active: this.isActive(),
      can_focus: false,
      pressedCallback: this.handleClicked,
      relief: Gtk.ReliefStyle.NONE,
      tooltip_text: name,
    }, [
        h(Box, { spacing: 4 }, [
          h(Image, {
            gicon: Icon({ icon: icon, iconType: iconType }),
            icon_size: Gtk.IconSize.SMALL_TOOLBAR,
          }),
          h(Label, { label: short }),
        ]),
      ]);
  }
}

exports.PlacesEntry = PlacesEntry;
exports.default = connect(["panelService", "placeService"])(PlacesEntry);
