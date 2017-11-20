const { DragAction } = imports.gi.Gdk;
const { DestDefaults, ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const autoBind = require("../Gjs/autoBind").default;
const { ActionService } = require("./ActionService");

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {string} label
 *
 * @param {IProps} props
 */
function ActionBarRm(props) {
  Component.call(this, props);
  autoBind(this, ActionBarRm.prototype, __filename);
}

ActionBarRm.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
ActionBarRm.prototype.props = undefined;

/**
 * @param {*} _node
 * @param {{ get_selected_action(): number }} _dragContext
 * @param {number} _x
 * @param {number} _y
 * @param {{ get_uris(): string[] }} selectionData
 */
ActionBarRm.prototype.handleDrop = function(_node, _dragContext, _x, _y, selectionData) {
  const uris = selectionData.get_uris();
  this.props.actionService.rm(uris);
};

ActionBarRm.prototype.handlePressed = function() {
  this.props.actionService.rm();
};

/**
 * @param {*} node
 */
ActionBarRm.prototype.ref = function(node) {
  node.drag_dest_set(DestDefaults.ALL, [], DragAction.MOVE);
  node.drag_dest_add_uri_targets();
};

ActionBarRm.prototype.render = function() {
  return (
    h("button", {
      can_focus: false,
      expand: true,
      label: this.props.label,
      on_drag_data_received: this.handleDrop,
      on_pressed: this.handlePressed,
      ref: this.ref,
      relief: ReliefStyle.NONE,
    })
  );
};

exports.ActionBarRm = ActionBarRm;
exports.default = connect(["actionService"])(ActionBarRm);
