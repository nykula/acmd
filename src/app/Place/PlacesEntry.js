const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { Place } = require("../../domain/Place/Place");
const { autoBind } = require("../Gjs/autoBind");
const Icon = require("../Icon/Icon").default;
const minLength = require("../MinLength/minLength").default;
const { PanelService } = require("../Panel/PanelService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {Place} place
 * @property {PanelService} panelService
 * @property {string} short
 * @property {PlaceService} placeService
 *
 * @param {IProps} props
 */
function PlacesEntry(props) {
  Component.call(this, props);
  autoBind(this, PlacesEntry.prototype, __filename);
}

PlacesEntry.prototype = Object.create(Component.prototype);

/** @type {IProps} */
PlacesEntry.prototype.props = undefined;

PlacesEntry.prototype.activeUri = function() {
  return this.props.panelService.getActiveMountUri(this.props.panelId);
};

PlacesEntry.prototype.isActive = function() {
  return this.props.place.rootUri === this.activeUri();
};

PlacesEntry.prototype.handleClicked = function() {
  const { panelService, place, placeService } = this.props;
  const { location } = this.props.panelService.getActiveTab();
  const isActive = place.rootUri === this.activeUri();

  const menu = new Gtk.Menu();
  let item;

  if (place.rootUri && place.rootUri !== location) {
    item = new Gtk.MenuItem();
    item.label = "Open";
    item.connect("activate", () => {
      this.props.panelService.ls(place.rootUri, this.props.panelId);
    });
    menu.add(item);
  }

  if (place.rootUri && !isActive) {
    item = new Gtk.MenuItem();
    item.label = "Unmount";
    item.connect("activate", () => {
      placeService.unmount(place.rootUri, panelService.refresh);
    });
    menu.add(item);
  }

  if (!place.rootUri) {
    item = new Gtk.MenuItem();
    item.label = "Mount";
    item.connect("activate", () => {
      placeService.mountUuid(place.uuid, panelService.refresh);
    });
    menu.add(item);
  }

  if (!item) {
    return;
  }

  menu.show_all();
  menu.popup(null, null, null, null, null);
};

PlacesEntry.prototype.render = function() {
  const { place, short } = this.props;
  const { icon, iconType, name } = place;

  return h(
    ToggleButton,
    {
      active: this.isActive(),
      can_focus: false,
      on_clicked: this.handleClicked,
      relief: Gtk.ReliefStyle.NONE,
      tooltip_text: name,
    },
    [
      h("box", { spacing: 4 }, [
        h("image", {
          gicon: Icon({ icon: icon, iconType: iconType }),
          icon_size: Gtk.IconSize.SMALL_TOOLBAR,
        }),
        h("label", { label: short }),
      ]),
    ],
  );
};

exports.PlacesEntry = PlacesEntry;
exports.default = connect(["panelService", "placeService"])(PlacesEntry);
