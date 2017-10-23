const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const autoBind = require("../Gjs/autoBind").default;
const { PanelService } = require("../Panel/PanelService");
const TabListItem = require("./TabListItem").default;

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService} panelService
 *
 * @param {IProps} IProps
 */
function TabList(props) {
  Component.call(this, props);
  autoBind(this, TabList.prototype);
}

TabList.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
TabList.prototype.props = undefined;

TabList.prototype.render = function() {
  const panel = this.props.panelService.entities[this.props.panelId];
  const { activeTabId, tabIds } = panel;

  return tabIds.length === 1 ? h("box") : (
    h("box", [
      tabIds.map(id => (
        h(TabListItem, {
          active: activeTabId === id,
          id: id,
          panelId: this.props.panelId,
          key: id,
        })
      )),
    ])
  );
};

exports.TabList = TabList;
exports.default = connect(["panelService"])(TabList);
