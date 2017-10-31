const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { Place } = require("../../domain/Place/Place");
const { ActionService } = require("../Action/ActionService");
const { autoBind } = require("../Gjs/autoBind");
const Icon = require("../Icon/Icon").default;
const minLength = require("../MinLength/minLength").default;
const getActiveMountUri = require("../Mount/getActiveMountUri").default;
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {number} panelId
 * @property {Place} place
 * @property {PanelService} panelService
 * @property {string} short
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function PlacesEntry(props) {
  Component.call(this, props);
  autoBind(this, PlacesEntry.prototype);
}

PlacesEntry.prototype = Object.create(Component.prototype);

/** @type {IProps} */
PlacesEntry.prototype.props = undefined;

PlacesEntry.prototype.activeUri = function() {
  return getActiveMountUri(this.props, this.props.panelId);
};

PlacesEntry.prototype.isActive = function() {
  return this.props.place.rootUri === this.activeUri();
};

PlacesEntry.prototype.location = function() {
  return this.props.tabService.entities[this.props.panelId].location;
};

PlacesEntry.prototype.handleClicked = function() {
  const { place } = this.props;
  const isActive = place.rootUri === this.activeUri();

  const menu = new Gtk.Menu();
  let item;

  if (place.rootUri && place.rootUri !== this.location()) {
    item = new Gtk.MenuItem();
    item.label = "Open";
    item.connect("activate", () => {
      this.props.actionService.ls(this.props.panelId, place.rootUri);
    });
    menu.add(item);
  }

  if (place.rootUri && !isActive) {
    item = new Gtk.MenuItem();
    item.label = "Unmount";
    item.connect("activate", () => {
      this.props.actionService.unmount(place.rootUri);
    });
    menu.add(item);
  }

  if (!place.rootUri) {
    item = new Gtk.MenuItem();
    item.label = "Mount";
    item.connect("activate", () => {
      this.props.actionService.mount(place.uuid);
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

  return (
    h(ToggleButton, {
      active: this.isActive(),
      can_focus: false,
      relief: Gtk.ReliefStyle.NONE,
      on_clicked: this.handleClicked,
      tooltip_text: name,
    }, [
      h("box", { spacing: 4 }, [
        h("image", {
          gicon: Icon({ icon: icon, iconType: iconType }),
          icon_size: Gtk.IconSize.SMALL_TOOLBAR,
        }),
        h("label", { label: short }),
      ]),
    ])
  );
};

exports.PlacesEntry = PlacesEntry;
exports.default = connect(["actionService", "panelService", "tabService"])(PlacesEntry);
