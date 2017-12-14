const Gtk = imports.gi.Gtk;
const { Box, Image, Label } = Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { computed, extendObservable } = require("mobx");
const { Place } = require("../../domain/Place/Place");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {string} name
 * @property {number} panelId
 * @property {PanelService?} [panelService]
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

    /**
     * @type {Place}
     */
    this.place = (/** @type {any} */ (undefined));

    extendObservable(this, {
      place: computed(this.getPlace),
    });
  }

  activeUri() {
    const { getActiveMountUri } =
      /** @type {PanelService} */ (this.props.panelService);

    return getActiveMountUri(this.props.panelId);
  }

  getPlace() {
    const { entities } =
      /** @type {PlaceService} */ (this.props.placeService);

    return entities[this.props.name];
  }

  isActive() {
    return this.place.rootUri === this.activeUri();
  }

  handleClicked() {
    const { getActiveTab, ls, refresh } =
      /** @type {PanelService} */ (this.props.panelService);

    const { mountUuid, unmount } =
    /** @type {PlaceService} */ (this.props.placeService);

    const { rootUri, uuid } = this.place;
    const { location } = getActiveTab();

    const menu = new Gtk.Menu();
    let item;

    if (rootUri && rootUri !== location) {
      item = new Gtk.MenuItem();
      item.label = "Open";
      item.connect("activate", () => {
        ls(rootUri, this.props.panelId);
      });
      menu.add(item);
    }

    if (rootUri && !this.isActive()) {
      item = new Gtk.MenuItem();
      item.label = "Unmount";
      item.connect("activate", () => {
        unmount(rootUri, refresh);
      });
      menu.add(item);
    }

    if (!rootUri) {
      item = new Gtk.MenuItem();
      item.label = "Mount";
      item.connect("activate", () => {
        mountUuid(uuid, refresh);
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
    const { shortNames } =
      /** @type {PlaceService} */ (this.props.placeService);

    const { icon, iconType, name } = this.place;

    return h(ToggleButton, {
      active: this.isActive(),
      can_focus: false,
      pressedCallback: this.handleClicked,
      relief: Gtk.ReliefStyle.NONE,
      tooltip_text: name,
    }, [
        h(Box, { spacing: 4 }, [
          h(Image, {
            gicon: GioIcon.get({ icon: icon, iconType: iconType }),
            icon_size: Gtk.IconSize.SMALL_TOOLBAR,
          }),
          h(Label, { label: shortNames[name] }),
        ]),
      ]);
  }
}

exports.PlacesEntry = PlacesEntry;
exports.default = connect(["panelService", "placeService"])(PlacesEntry);
