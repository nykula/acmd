const { IconSize } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { GioService } = require("../Gio/GioService");
const { FileHandler } = require("../../domain/File/FileHandler");

/**
 * @typedef IProps
 * @property {GioService} gioService
 * @property {FileHandler} handler
 * @property {number} iconSize
 * @property {string[]} uris
 *
 * @param {IProps} props
 */
function CtxMenuHandler(props) {
  Component.call(this, props);
  autoBind(this, CtxMenuHandler.prototype, __filename);
}

CtxMenuHandler.prototype = Object.create(Component.prototype);

/** @type {IProps} */
CtxMenuHandler.prototype.props = undefined;

CtxMenuHandler.prototype.handleActivate = function() {
  this.props.gioService.launch(this.props.handler, this.props.uris);
};

CtxMenuHandler.prototype.render = function() {
  const { displayName, icon } = this.props.handler;

  return h("menu-item", { on_activate: this.handleActivate }, [
    h("box", [
      h("image", {
        icon_name: icon || "utilities-terminal",
        pixel_size: this.props.iconSize,
      }),

      h("label", { label: displayName }),
    ]),
  ]);
};

exports.CtxMenuHandler = CtxMenuHandler;
exports.default = connect(["gioService"])(CtxMenuHandler);
