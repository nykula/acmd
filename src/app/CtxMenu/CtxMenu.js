const { Menu, SeparatorMenuItem } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { h } = require("../Gjs/GtkInferno");
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { RefService } = require("../Ref/RefService");
const { SelectService } = require("../Select/SelectService");
const CtxMenuAction = require("./CtxMenuAction").default;
const CtxMenuHandler = require("./CtxMenuHandler").default;

/**
 * @typedef IProps
 * @property {RefService?} [refService]
 * @property {SelectService?} [selectService]
 *
 * @extends Component<IProps>
 */
class CtxMenu extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, CtxMenu.prototype, __filename);
  }

  render() {
    const { set } = /** @type {RefService} */ (this.props.refService);
    const { handlers, getUris } =
      /** @type {SelectService} */ (this.props.selectService);

    const iconSize = 16;
    const uris = getUris();

    return (
      h("stub-box", [
        h(Menu, { ref: set("ctxMenu") }, [
          ...handlers.map(handler => {
            return h(CtxMenuHandler, { handler, iconSize, uris });
          }),

          h(SeparatorMenuItem),

          h(CtxMenuAction, {
            icon: "edit-cut",
            iconSize,
            id: "selectService.cut",
            label: "Cut",
          }),

          h(CtxMenuAction, {
            icon: "edit-copy",
            iconSize,
            id: "selectService.copy",
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
  }
}

exports.CtxMenu = CtxMenu;
exports.default = connect(["refService", "selectService"])(CtxMenu);
