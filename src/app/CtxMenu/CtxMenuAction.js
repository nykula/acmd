const { Box, IconSize, Image, Label, MenuItem } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");

/**
 * @typedef IProps
 * @property {ActionService?} [actionService]
 * @property {string} icon
 * @property {number} iconSize
 * @property {string} id
 * @property {string} label
 *
 * @extends Component<IProps>
 */
class CtxMenuAction extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, CtxMenuAction.prototype, __filename);
  }

  /**
   * @param {MenuItem} menuItem
   */
  ref(menuItem) {
    if (menuItem) {
      const { get } = /** @type {ActionService} */ (this.props.actionService);
      menuItem.connect("activate", get(this.props.id).handler);
    }
  }

  render() {
    return h(MenuItem, { ref: this.ref }, [
      h(Box, [
        h(Image, {
          icon_name: this.props.icon + "-symbolic",
          pixel_size: this.props.iconSize,
        }),
        h(Label, { label: this.props.label }),
      ]),
    ]);
  }
}

exports.CtxMenuAction = CtxMenuAction;
exports.default = connect(["actionService"])(CtxMenuAction);
