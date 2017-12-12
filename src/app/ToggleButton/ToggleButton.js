const { Button, StateFlags } = imports.gi.Gtk;
const assign = require("lodash/assign");
const Component = require("inferno-component").default;
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");

/**
 * @typedef IProps
 * @property {boolean} active
 * @property {any?} [pressedCallback]
 *
 * @extends Component<IProps>
 */
class ToggleButton extends Component {
  /**
   * @param {Partial<Button> & IProps} props
   */
  constructor(props) {
    super(props);

    /**
     * @type {Button | undefined}
     */
    this.node = undefined;

    autoBind(this, ToggleButton.prototype, __filename);
  }

  componentDidUpdate() {
    this.resetActive();
  }

  /**
   * @param {Button} node
   */
  ref(node) {
    this.node = node;
    this.resetActive();

    if (this.props.pressedCallback) {
      this.node.connect("pressed", this.props.pressedCallback);
    }
  }

  resetActive() {
    if (this.node && this.props.active) {
      this.node.set_state_flags(StateFlags.CHECKED, false);
    } else if (this.node) {
      this.node.unset_state_flags(StateFlags.CHECKED);
    }
  }

  render() {
    return (
      h(Button, assign({}, this.props, {
        ref: this.ref,
      }))
    );
  }
}

exports.default = ToggleButton;
