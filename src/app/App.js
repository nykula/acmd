
const Gtk = imports.gi.Gtk;
const h = require("inferno-hyperscript").default;
const ActionBar = require("./Action/ActionBar").default;
const MenuBar = require("./MenuBar/MenuBar").default;
const MountList = require("./Mount/MountList").default;
const Panel = require("./Panel/Panel").default;
const Prompt = require("./Prompt/Prompt").default;
const Toolbar = require("./Toolbar/Toolbar").default;

exports.render = ({ refstore }) => {
  return (
    h("box", { orientation: Gtk.Orientation.VERTICAL }, [
      h(MenuBar),
      h(Toolbar),
      h("h-separator"),
      h("h-box", [
        h(MountList, { panelId: 0 }),
        h(MountList, { panelId: 1 }),
      ]),
      h("h-separator"),
      h("h-box", { homogeneous: true, spacing: 1 }, [0, 1].map(panelId => h(Panel, {
        id: panelId,
        key: panelId,
        refstore: refstore,
      }))),
      h(Prompt),
      h(ActionBar),
    ])
  );
};
