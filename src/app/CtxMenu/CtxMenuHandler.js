const { Box, IconSize, Image, Label, MenuItem } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { h } = require("../Gjs/GtkInferno");
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { GioService } = require("../Gio/GioService");
const { FileHandler } = require("../../domain/File/FileHandler");

/**
 * @typedef IProps
 * @property {GioService?} [gioService]
 * @property {FileHandler} handler
 * @property {number} iconSize
 * @property {string[]} uris
 *
 * @extends Component<IProps>
 */
class CtxMenuHandler extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, CtxMenuHandler.prototype, __filename);
  }

  handleActivate() {
    const { launch } = /** @type {GioService} */ (this.props.gioService);
    launch(this.props.handler, this.props.uris);
  }

  /**
   * @param {MenuItem} menuItem
   */
  ref(menuItem) {
    menuItem.connect("activate", this.handleActivate);
  }

  render() {
    const { displayName, icon } = this.props.handler;

    return (
      h(MenuItem, { ref: this.ref }, [
        h(Box, [
          h(Image, {
            icon_name: icon || "utilities-terminal",
            pixel_size: this.props.iconSize,
          }),
          h(Label, { label: displayName }),
        ]),
      ])
    );
  }
}

exports.CtxMenuHandler = CtxMenuHandler;
exports.default = connect(["gioService"])(CtxMenuHandler);
