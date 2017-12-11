const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { RefService } = require("../Ref/RefService");
const { SelectionService } = require("../Selection/SelectionService");
const CtxMenuAction = require("./CtxMenuAction").default;
const CtxMenuHandler = require("./CtxMenuHandler").default;

/**
 * @typedef IProps
 * @property {RefService} refService
 * @property {SelectionService} selectionService
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

CtxMenu.prototype.render = function() {
  const { handlers, getUris } = this.props.selectionService;
  const iconSize = 16;
  const uris = getUris();

  return (
    h("stub-box", [
      h("menu", { ref: this.props.refService.set("ctxMenu") }, [
        ...handlers.map(handler => {
          return h(CtxMenuHandler, { handler, iconSize, uris });
        }),

        h("separator-menu-item"),

        h(CtxMenuAction, {
          icon: "edit-cut",
          iconSize,
          id: "selectionService.cut",
          label: "Cut",
        }),

        h(CtxMenuAction, {
          icon: "edit-copy",
          iconSize,
          id: "selectionService.copy",
          label: "Copy",
        }),

        h(CtxMenuAction, {
          icon: "edit-paste",
          iconSize,
          id: "directoryService.paste",
          label: "Paste",
        }),
      ]),
    ])
  );
};

exports.CtxMenu = CtxMenu;
exports.default = connect(["refService", "selectionService"])(CtxMenu);
