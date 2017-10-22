const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { Mount } = require("../../domain/Mount/Mount");
const { ActionService } = require("../Action/ActionService");
const Icon = require("../Icon/Icon").default;
const minLength = require("../MinLength/minLength").default;
const getActiveMountUri = require("../Mount/getActiveMountUri").default;
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {Mount} mount
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {string} short
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function MountListEntry(props) {
  Component.call(this, props);
  this.handleClicked = this.handleClicked.bind(this);
}

MountListEntry.prototype = Object.create(Component.prototype);

/** @type {IProps} */
MountListEntry.prototype.props = undefined;

MountListEntry.prototype.activeUri = function() {
  return getActiveMountUri(this.props, this.props.panelId);
};

MountListEntry.prototype.isActive = function() {
  return this.props.mount.rootUri === this.activeUri();
};

MountListEntry.prototype.location = function() {
  return this.props.tabService.entities[this.props.panelId].location;
};

MountListEntry.prototype.handleClicked = function() {
  const { mount } = this.props;
  const isActive = mount.rootUri === this.activeUri();

  const menu = new Gtk.Menu();
  let item;

  if (mount.rootUri && mount.rootUri !== this.location()) {
    item = new Gtk.MenuItem();
    item.label = "Open";
    item.connect("activate", () => {
      this.props.actionService.ls(this.props.panelId, mount.rootUri);
    });
    menu.add(item);
  }

  if (mount.rootUri && !isActive) {
    item = new Gtk.MenuItem();
    item.label = "Unmount";
    item.connect("activate", () => {
      this.props.actionService.unmount(mount.rootUri);
    });
    menu.add(item);
  }

  if (!mount.rootUri) {
    item = new Gtk.MenuItem();
    item.label = "Mount";
    item.connect("activate", () => {
      this.props.actionService.mount(mount.uuid);
    });
    menu.add(item);
  }

  if (!item) {
    return;
  }

  menu.show_all();
  menu.popup(null, null, null, null, null);
};

MountListEntry.prototype.render = function() {
  const { mount, short } = this.props;
  const { icon, iconType, name } = mount;

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

exports.default = connect(["actionService", "panelService", "tabService"])(MountListEntry);
