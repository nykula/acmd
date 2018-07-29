const { Button, StateFlags } = imports.gi.Gtk;
const assign = require("lodash/assign");
const { Component } = require("inferno");
const { Drag } = require("../Drag/Drag");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { MouseEvent } = require("../Mouse/MouseEvent");

/**
 * @typedef IProps
 * @property {boolean} active
 * @property {any?} [dropCallback]
 * @property {any?} [menuCallback]
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
    this.button = undefined;

    autoBind(this, ToggleButton.prototype, __filename);
  }

  componentDidUpdate() {
    this.resetActive();
  }

  /**
   * @param {Button | null} button
   */
  ref(button) {
    if (!button) {
      return;
    }

    this.button = button;
    this.resetActive();

    if (this.props.dropCallback) {
      new Drag(button).onDrop(this.props.dropCallback);
    }

    if (this.props.menuCallback) {
      MouseEvent.connectMenu(this.button, this.props.menuCallback);
    }

    if (this.props.pressedCallback) {
      this.button.connect("pressed", this.props.pressedCallback);
    }
  }

  resetActive() {
    if (this.button && this.props.active) {
      this.button.set_state_flags(StateFlags.CHECKED, false);
    } else if (this.button) {
      this.button.unset_state_flags(StateFlags.CHECKED);
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
