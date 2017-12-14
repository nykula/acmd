const { MenuBar, MenuItem } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { h } = require("../Gjs/GtkInferno");
const MenuBarAction = require("./MenuBarAction").default;

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
      { id: "selectService.cut", label: "Cut" },
      { id: "selectService.copy", label: "Copy" },
      { id: "directoryService.paste", label: "Paste" },
      { id: "selectService.selectAll", label: "Select all" },
      { id: "selectService.deselectAll", label: "Deselect all" },
      { id: "selectService.invert", label: "Invert selection" },
      { id: "selectService.selectGlob", label: "Select glob" },
      { id: "selectService.deselectGlob", label: "Deselect glob" },
      { id: "selectService.selectDiff", label: "Compare directories" },
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

class MenuBarComponent extends Component {
  render() {
    return (
      h(MenuBar, menus.map(menu => (
        h("menu-item-with-submenu", {
          key: menu.label,
          label: menu.label,
        },
          menu.children.map(action => h(MenuBarAction, { action })),
        )
      )))
    );
  }
}

exports.MenuBar = MenuBarComponent;
