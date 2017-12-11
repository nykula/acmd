const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");

const menus = [
  {
    children: [
      { id: "panelService.createTab", label: "New tab" },
      { id: "directoryService.touch", label: "Create file" },
      { id: "directoryService.terminal", label: "Open terminal" },
      { id: "panelService.removeTab", label: "Close tab" },
      { id: "windowService.exit", label: "Exit" },
    ],

    label: "File",
  },

  {
    children: [
      { id: "selectionService.cut", label: "Cut" },
      { id: "selectionService.copy", label: "Copy" },
      { id: "directoryService.paste", label: "Paste" },
      { id: "selectionService.selectAll", label: "Select all" },
      { id: "selectionService.deselectAll", label: "Deselect all" },
      { id: "selectionService.invert", label: "Invert selection" },
      { id: "selectionService.selectGlob", label: "Select glob" },
      { id: "selectionService.deselectGlob", label: "Deselect glob" },
      { id: "selectionService.selectDiff", label: "Compare directories" },
    ],

    label: "Edit",
  },

  {
    children: [
      { id: "windowService.refresh", label: "Refresh" },
      { id: "windowService.showHidSys", label: "Hidden files" },
    ],

    label: "View",
  },

  {
    children: [
      { id: "panelService.levelUp", label: "Open parent" },
      { id: "panelService.back", label: "Back" },
      { id: "panelService.forward", label: "Forward" },
      { id: "panelService.ls", label: "Open location..." },
    ],

    label: "Go",
  },

  {
    children: [{ id: "windowService.issue", label: "Report issue" }],
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
              on_activate: this.props.actionService.get(child.id).handler,
            })
          )),
        )),
      ),
    )
  );
};

exports.MenuBar = MenuBar;
exports.default = connect(["actionService"])(MenuBar);
