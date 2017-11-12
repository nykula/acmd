const { IconSize } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { GioService } = require("../Gio/GioService");

/**
 * @typedef IProps
 * @property {string} action
 * @property {GioService} actionService
 * @property {string} icon
 * @property {number} iconSize
 * @property {string} label
 *
 * @param {IProps} props
 */
function CtxMenuAction(props) {
  Component.call(this, props);
  autoBind(this, CtxMenuAction.prototype, __filename);
}

CtxMenuAction.prototype = Object.create(Component.prototype);

/** @type {IProps} */
CtxMenuAction.prototype.props = undefined;

CtxMenuAction.prototype.handleActivate = function() {
  this.props.actionService[this.props.action]();
};

CtxMenuAction.prototype.render = function() {
  return h("menu-item", { on_activate: this.handleActivate }, [
    h("box", [
      h("image", {
        icon_name: this.props.icon + "-symbolic",
        pixel_size: this.props.iconSize,
      }),

      h("label", { label: this.props.label }),
    ]),
  ]);
};

exports.CtxMenuAction = CtxMenuAction;
exports.default = connect(["actionService"])(CtxMenuAction);
