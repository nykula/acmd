const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const autoBind = require("../Gjs/autoBind").default;
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;

/**
 * @typedef IProps
 * @property {boolean} active
 * @property {string} icon
 * @property {number} id
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function TabListItem(props) {
  Component.call(this, props);
  autoBind(this, TabListItem.prototype, __filename);
}

TabListItem.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
TabListItem.prototype.props = undefined;

TabListItem.prototype.handleClicked = function() {
  this.props.panelService.setActiveTabId({
    id: this.props.panelId,
    tabId: this.props.id,
  });
};

TabListItem.prototype.render = function() {
  const { active, icon } = this.props;
  const { location } = this.props.tabService.entities[this.props.id];
  let text = location.replace(/^.*\//, "") || "/";

  return (
    h(ToggleButton, {
      active: active,
      can_focus: false,
      on_clicked: this.handleClicked,
      relief: Gtk.ReliefStyle.NONE,
    }, [
        h("box", { spacing: 4 }, [
          icon ? (
            h("image", {
              icon_name: icon + "-symbolic",
              icon_size: Gtk.IconSize.SMALL_TOOLBAR,
            })
          ) : null,
          h("label", { label: text }),
        ]),
      ])
  );
};

exports.TabListItem = TabListItem;
exports.default = connect(["panelService", "tabService"])(TabListItem);
