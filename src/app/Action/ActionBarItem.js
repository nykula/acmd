const { Button, ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const ActionBarRm = require("./ActionBarRm").default;
const { ActionService } = require("./ActionService");

/**
 * @typedef IProps
 * @property {{ id: string, label: string, shortcut: string }} action
 * @property {ActionService?} [actionService]
 *
 * @extends Component<IProps>
 */
class ActionBarItem extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, ActionBarItem.prototype, __filename);
  }

  /**
   * @param {Button | null} button
   */
  ref(button) {
    if (!button) {
      return;
    }

    const { get } = /** @type {ActionService} */ (this.props.actionService);
    button.connect("pressed", get(this.props.action.id).handler);
  }

  render() {
    const { id, label, shortcut } = this.props.action;

    if (id === "rm") {
      return h(ActionBarRm, { label: shortcut + " " + label });
    }

    return (
      h(Button, {
        can_focus: false,
        expand: true,
        label: shortcut + " " + label,
        ref: this.ref,
        relief: ReliefStyle.NONE,
      })
    );
  }
}

exports.ActionBarItem = ActionBarItem;
exports.default = connect(["actionService"])(ActionBarItem);
