const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const autoBind = require("../Gjs/autoBind").default;
const { ActionService } = require("./ActionService");

const actions = [
  { type: "view", text: "View", shortcut: "F3" },
  { type: "editor", text: "Edit", shortcut: "F4" },
  { type: "cp", text: "Copy", shortcut: "F5" },
  { type: "mv", text: "Move", shortcut: "F6" },
  { type: "mkdir", text: "NewFolder", shortcut: "F7" },
  { type: "rm", text: "Delete", shortcut: "F8" },
  { type: "exit", text: "Exit", shortcut: "Alt+F4" },
];

/**
 * @typedef IProps
 * @property {ActionService} actionService
 *
 * @param {IProps} props
 */
function ActionBar(props) {
  Component.call(this, props);
  autoBind(this, ActionBar.prototype);
}

ActionBar.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
ActionBar.prototype.props = undefined;

/**
 * @param {string} type
 */
ActionBar.prototype.handlePressed = function(type) {
  return () => this.props.actionService[type]();
};

ActionBar.prototype.render = function() {
  return (
    h("box", { expand: false }, [
      actions.map(action => [
        h("button", {
          can_focus: false,
          expand: true,
          key: action.type,
          label: action.shortcut + " " + action.text,
          on_pressed: this.handlePressed(action.type),
          relief: Gtk.ReliefStyle.NONE,
        }),
        h("v-separator", { key: action.type + "+" }),
      ]),
    ])
  );
};

exports.default = connect(["actionService"])(ActionBar);
