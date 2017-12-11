const { StateFlags } = imports.gi.Gtk;
const assign = require("lodash/assign");
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { autoBind } = require("../Gjs/autoBind");

/**
 * @typedef INode
 * @property {(flags: number, clear: boolean) => void} set_state_flags
 * @property {(flags: number) => void} unset_state_flags
 *
 * @typedef IProps
 * @property {boolean} active
 *
 * @param {IProps} props
 */
function ToggleButton(props) {
  Component.call(this, props);
  autoBind(this, ToggleButton.prototype, __filename);
}

ToggleButton.prototype = Object.create(Component.prototype);

/**
 * @type {INode}
 */
ToggleButton.prototype.node = undefined;

/**
 * @type {IProps}
 */
ToggleButton.prototype.props = undefined;

ToggleButton.prototype.componentDidUpdate = function() {
  this.resetActive();
};

/**
 * @param {INode} node
 */
ToggleButton.prototype.ref = function(node) {
  this.node = node;
  this.resetActive();
};

ToggleButton.prototype.resetActive = function() {
  if (this.node && this.props.active) {
    this.node.set_state_flags(StateFlags.CHECKED, false);
  } else if (this.node) {
    this.node.unset_state_flags(StateFlags.CHECKED);
  }
};

ToggleButton.prototype.render = function() {
  return (
    h("button", assign({}, this.props, {
      ref: this.ref,
    }))
  );
};

exports.default = ToggleButton;
