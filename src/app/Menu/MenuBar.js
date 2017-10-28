const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");

const menus = [
  {
    children: [
      { action: "createTab", label: "New tab" },
      { action: "touch", label: "Create file" }, ,
      { action: "terminal", label: "Open terminal" },
      { action: "removeTab", label: "Close tab" },
      { action: "exit", label: "Exit" },
    ],

    label: "File",
  },

  {
    children: [
      { action: "refresh", label: "Refresh" },
      { action: "showHidSys", label: "Hidden files" },
    ],

    label: "View",
  },

  {
    children: [
      { action: "levelUp", label: "Open parent" },
      { action: "back", label: "Back" },
      { action: "forward", label: "Forward" },
      { action: "ls", label: "Open location..." },
    ],

    label: "Go",
  },

  {
    children: [{ action: "reportIssue", label: "Report issue" }],
    label: "Help",
  },
];

/**
 * @typedef IProps
 * @property {ActionService} actionService
 *
 * @param {IProps} props
 */
function MenuBar(props) {
  Component.call(this, props);
}

MenuBar.prototype = Object.create(Component.prototype);

/** @type {IProps} */
MenuBar.prototype.props = undefined;

MenuBar.prototype.render = function() {
  return (
    h("menu-bar",
      menus.map(menu => (
        h("menu-item-with-submenu", { key: menu.label, label: menu.label },
          menu.children.map(child => (
            h("menu-item", {
              label: child.label,
              on_activate: this.props.actionService[child.action],
            })
          )),
        )),
      ),
    )
  );
};

exports.MenuBar = MenuBar;
exports.default = connect(["actionService"])(MenuBar);
