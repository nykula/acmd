const { Box, Button, ReliefStyle, VSeparator } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const ActionBarItem = require("./ActionBarItem").default;

const actions = [
  { id: "cursorService.view", label: "View", shortcut: "F3" },
  { id: "cursorService.edit", label: "Edit", shortcut: "F4" },
  { id: "oppositeService.cp", label: "Copy", shortcut: "F5" },
  { id: "oppositeService.mv", label: "Move", shortcut: "F6" },
  { id: "directoryService.mkdir", label: "NewFolder", shortcut: "F7" },
  { id: "selectService.rm", label: "Delete", shortcut: "F8" },
  { id: "windowService.exit", label: "Exit", shortcut: "Alt+F4" },
];

class ActionBar extends Component {
  constructor() {
    super();
    autoBind(this, ActionBar.prototype, __filename);
  }

  render() {
    return (
      h(Box, { expand: false }, actions.reduce((prev, action) => prev.concat([
        h(ActionBarItem, {
          action,
          key: action.id,
        }),

        h(VSeparator, { key: action.id + "+" }),
      ]), /** @type {any[]} */ ([])))
    );
  }
}

exports.ActionBar = ActionBar;
