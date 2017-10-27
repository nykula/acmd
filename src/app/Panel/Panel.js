const Directory = require("../Directory/Directory").default;
const Gtk = imports.gi.Gtk;
const h = require("inferno-hyperscript").default;
const Location = require("../Location/Location").default;
const Mount = require("../Mount/Mount").default;
const Stats = require("../Stats/Stats").default;
const TabList = require("../Tab/TabList").default;

exports.default = Panel;
function Panel({ id }) {
  return (
    h("box", { orientation: Gtk.Orientation.VERTICAL }, [
      h(Mount, {
        key: "MOUNT",
        panelId: id,
      }),
      h(TabList, {
        key: "TAB_LIST",
        panelId: id,
      }),
      h("h-separator"),
      h(Location, {
        key: "LOCATION",
        panelId: id,
      }),
      h("h-separator"),
      h("scrolled-window", {
        expand: true,
        hscrollbar_policy: Gtk.PolicyType.NEVER,
        key: "DIRECTORY",
      }, [
        h(Directory, { panelId: id }),
      ]),
      h(Stats, {
        key: "STATS",
        panelId: id,
      }),
    ])
  );
}
