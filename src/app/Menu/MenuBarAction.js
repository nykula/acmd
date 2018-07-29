const { MenuItem } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");

/**
 * @typedef IProps
 * @property {{ id: string, label: string }} action
 * @property {ActionService?} [actionService]
 *
 * @extends Component<IProps>
 */
class MenuBarAction extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, MenuBarAction.prototype, __filename);
  }

  /**
   * @param {MenuItem | null} menuItem
   */
  ref(menuItem) {
    if (menuItem) {
      const { get } =
        /** @type {ActionService} */ (this.props.actionService);

      const { handler } = get(this.props.action.id);
      menuItem.connect("activate", handler);
    }
  }

  render() {
    return (
      h(MenuItem, {
        label: this.props.action.label,
        ref: this.ref,
      })
    );
  }
}

exports.MenuBarAction = MenuBarAction;
exports.default = inject("actionService")(observer(MenuBarAction));
