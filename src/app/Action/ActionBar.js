const { ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const ActionBarRm = require("./ActionBarRm").default;
const { ActionService } = require("./ActionService");

const actions = [
  { id: "cursorService.view", label: "View", shortcut: "F3" },
  { id: "cursorService.edit", label: "Edit", shortcut: "F4" },
  { id: "oppositeService.cp", label: "Copy", shortcut: "F5" },
  { id: "oppositeService.mv", label: "Move", shortcut: "F6" },
  { id: "directoryService.mkdir", label: "NewFolder", shortcut: "F7" },
  { id: "selectionService.rm", label: "Delete", shortcut: "F8" },
  { id: "windowService.exit", label: "Exit", shortcut: "Alt+F4" },
];

/**
 * @typedef IProps
 * @property {ActionService} actionService
 *
 * @param {IProps} props
 */
function ActionBar(props) {
  Component.call(this, props);
  autoBind(this, ActionBar.prototype, __filename);
}

ActionBar.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
ActionBar.prototype.props = undefined;

ActionBar.prototype.render = function() {
  return (
    h("box", { expand: false }, actions.reduce((prev, action) => prev.concat([
      action.id === "rm" ? h(ActionBarRm, {
          key: action.id,
          label: action.shortcut + " " + action.label,
        }) : h("button", {
          can_focus: false,
          expand: true,
          key: action.id,
          label: action.shortcut + " " + action.label,
          on_pressed: this.props.actionService.get(action.id).handler,
          relief: ReliefStyle.NONE,
        }),
      h("v-separator", { key: action.id + "+" }),
    ]), []))
  );
};

exports.ActionBar = ActionBar;
exports.default = connect(["actionService"])(ActionBar);
