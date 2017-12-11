const { Box, Label, ListBox, ListBoxRow } = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { action, autorun, extendObservable, observable } = require("mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
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

  autoBind(this, Location.prototype, __filename);

  extendObservable(this, {
    list: observable.ref(undefined),
    refList: action(this.refList),
    refRow: action(this.refRow),
    row: observable.ref(undefined),
  });

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

/**
 * @param {ListBox} node
 */
Location.prototype.refList = function(node) {
  this.list = node;
};

/**
 * @param {ListBoxRow} node
 */
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
    h(ListBox, { ref: this.refList }, [
      h(ListBoxRow, { ref: this.refRow }, [
        h(Box, { border_width: 2 }, [
          h(Box, { border_width: 2 }),
          h(Label, {
            ellipsize: EllipsizeMode.MIDDLE,
            label: label,
          }),
        ]),
      ]),
    ])
  );
};

exports.Location = Location;
exports.default = connect(["panelService", "tabService"])(Location);
