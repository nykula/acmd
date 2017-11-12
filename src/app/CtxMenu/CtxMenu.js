const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { ActionService } = require("../Action/ActionService");
const { FileService } = require("../File/FileService");
const Refstore = require("../Refstore/Refstore").default;
const CtxMenuAction = require("./CtxMenuAction").default;
const CtxMenuHandler = require("./CtxMenuHandler").default;

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {FileService} fileService
 * @property {Refstore} refstore
 *
 * @param {IProps} props
 */
function CtxMenu(props) {
  Component.call(this, props);
  autoBind(this, CtxMenu.prototype, __filename);
}

CtxMenu.prototype = Object.create(Component.prototype);

/** @type {IProps} */
CtxMenu.prototype.props = undefined;

/**
 * @param {*} node
 */
CtxMenu.prototype.ref = function(node) {
  this.props.refstore.set("ctxMenu")(node);
};

CtxMenu.prototype.render = function() {
  const iconSize = 16;
  const files = this.props.actionService.getActiveFiles();
  const uris = files.filter(x => !!x && !!x.uri).map(x => x.uri);

  return (
    h("stub-box", [ // GtkMenu makes itself child of GtkWindow.
      h("menu", { ref: this.ref }, [
        ...this.props.fileService.handlers.map(handler => {
          return h(CtxMenuHandler, { handler, iconSize, uris });
        }),

        h("separator-menu-item"),

        h(CtxMenuAction, { action: "cut", icon: "edit-cut", iconSize, label: "Cut" }),
        h(CtxMenuAction, { action: "copy", icon: "edit-copy", iconSize, label: "Copy" }),
        h(CtxMenuAction, { action: "paste", icon: "edit-paste", iconSize, label: "Paste" }),
      ]),
    ])
  );
};

exports.CtxMenu = CtxMenu;
exports.default = connect(["actionService", "fileService", "refstore"])(CtxMenu);
