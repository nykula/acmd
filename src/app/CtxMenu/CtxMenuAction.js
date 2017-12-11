const { Box, IconSize, Image, Label, MenuItem } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {string} icon
 * @property {number} iconSize
 * @property {string} id
 * @property {string} label
 *
 * @param {IProps} props
 */
function CtxMenuAction(props) {
  Component.call(this, props);
  autoBind(this, CtxMenuAction.prototype, __filename);
}

CtxMenuAction.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
CtxMenuAction.prototype.props = undefined;

/**
 * @param {MenuItem} menuItem
 */
CtxMenuAction.prototype.ref = function(menuItem) {
  if (menuItem) {
    const action = this.props.actionService.get(this.props.id);
    menuItem.connect("activate", action.handler);
  }
};

CtxMenuAction.prototype.render = function() {
  return h(MenuItem, { ref: this.ref }, [
    h(Box, [
      h(Image, {
        icon_name: this.props.icon + "-symbolic",
        pixel_size: this.props.iconSize,
      }),

      h(Label, { label: this.props.label }),
    ]),
  ]);
};

exports.CtxMenuAction = CtxMenuAction;
exports.default = connect(["actionService"])(CtxMenuAction);
