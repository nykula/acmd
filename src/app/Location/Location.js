const Pango = imports.gi.Pango;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const h = require("inferno-hyperscript").default;
const { autorun, extendObservable } = require("mobx");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function Location(props) {
  Component.call(this, props);

  extendObservable(this, {
    list: this.list,
    row: this.row,
  });

  this.refList = this.refList.bind(this);
  this.refRow = this.refRow.bind(this);
  this.updateSelection = this.updateSelection.bind(this);

  this.unsubscribeSelection = autorun(this.updateSelection);
}

Location.prototype = Object.create(Component.prototype);

/**
 * @type {{ select_row(node: any): void, unselect_row(node: any): void }}
 */
Location.prototype.list = undefined;

/**
 * @type {IProps}
 */
Location.prototype.props = undefined;

/**
 * @type {any}
 */
Location.prototype.row = undefined;

Location.prototype.componentWillUnmount = function() {
  this.unsubscribeSelection();
};

Location.prototype.isActive = function() {
  return this.props.panelService.activeId === this.props.panelId;
};

Location.prototype.tab = function() {
  const { activeTabId } = this.props.panelService.entities[this.props.panelId];
  return this.props.tabService.entities[activeTabId];
};

Location.prototype.refList = function(node) {
  this.list = node;
};

Location.prototype.refRow = function(node) {
  this.row = node;
};

Location.prototype.updateSelection = function() {
  if (!this.list || !this.row) {
    return;
  }

  if (this.isActive()) {
    this.list.select_row(this.row);
  } else {
    this.list.unselect_row(this.row);
  }
};

Location.prototype.render = function() {
  const { location } = this.tab();
  const label = location.replace(/\/?$/, "/*").replace(/^file:\/\//, "");
  return (
    h("list-box", { ref: this.refList }, [
      h("list-box-row", { ref: this.refRow }, [
        h("box", { border_width: 2 }, [
          h("box", { border_width: 2 }),
          h("label", {
            label: label,
            ellipsize: Pango.EllipsizeMode.MIDDLE,
          }),
        ]),
      ]),
    ])
  );
};

exports.Location = Location;
exports.default = connect(["panelService", "tabService"])(Location);
