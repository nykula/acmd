const Gtk = imports.gi.Gtk;
const h = require("inferno-hyperscript").default;
const ActionBar = require("./Action/ActionBar").default;
const CtxMenu = require("./CtxMenu/CtxMenu").default;
const Jobs = require("./Job/Jobs").default;
const MenuBar = require("./Menu/MenuBar").default;
const Places = require("./Mount/Places").default;
const Panel = require("./Panel/Panel").default;
const Prompt = require("./Prompt/Prompt").default;
const Toolbar = require("./Toolbar/Toolbar").default;

exports.render = () => {
  return (
    h("box", { orientation: Gtk.Orientation.VERTICAL }, [
      h(MenuBar),
      h(Toolbar),
      h("h-separator"),
      h("h-box", [
        h(Places, { panelId: 0 }),
        h(Places, { panelId: 1 }),
      ]),
      h("h-separator"),
      h("h-box", { homogeneous: true, spacing: 1 }, [0, 1].map(panelId => h(Panel, {
        id: panelId,
        key: panelId,
      }))),
      h(Prompt),
      h(ActionBar),
      h(CtxMenu),
      h(Jobs),
    ])
  );
};
