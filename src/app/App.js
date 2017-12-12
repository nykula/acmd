const { Box, HBox, HSeparator, Orientation } = imports.gi.Gtk;
const { ActionBar } = require("./Action/ActionBar");
const CtxMenu = require("./CtxMenu/CtxMenu").default;
const { h } = require("./Gjs/GtkInferno");
const Jobs = require("./Job/Jobs").default;
const { MenuBar } = require("./Menu/MenuBar");
const Panel = require("./Panel/Panel").default;
const Places = require("./Place/Places").default;
const Prompt = require("./Prompt/Prompt").default;
const Toolbar = require("./Toolbar/Toolbar").default;

exports.render = () => {
  return (
    h(Box, { orientation: Orientation.VERTICAL }, [
      h(MenuBar),
      h(Toolbar),
      h(HSeparator),
      h(HBox, [
        h(Places, { panelId: 0 }),
        h(Places, { panelId: 1 }),
      ]),
      h(HSeparator),
      h(HBox, { homogeneous: true, spacing: 1 }, [0, 1].map(panelId => h(Panel, {
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
