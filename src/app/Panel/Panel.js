const { Box, HSeparator, Orientation, PolicyType, ScrolledWindow } = imports.gi.Gtk;
const Directory = require("../Directory/Directory").default;
const { h } = require("../Gjs/GtkInferno");
const Location = require("../Location/Location").default;
const Mount = require("../Mount/Mount").default;
const Stats = require("../Stats/Stats").default;
const TabList = require("../Tab/TabList").default;

exports.default = Panel;
/**
 * @param {{ id: number }} props
 */
function Panel(props) {
  const panelId = props.id;

  return (
    h(Box, { orientation: Orientation.VERTICAL }, [
      h(Mount, {
        key: "MOUNT",
        panelId,
      }),
      h(TabList, {
        key: "TAB_LIST",
        panelId,
      }),
      h(HSeparator),
      h(Location, {
        key: "LOCATION",
        panelId,
      }),
      h(HSeparator),
      h(ScrolledWindow, {
        expand: true,
        hscrollbar_policy: PolicyType.NEVER,
        key: "DIRECTORY",
      }, [
        h(Directory, { panelId }),
      ]),
      h(Stats, {
        key: "STATS",
        panelId,
      }),
    ])
  );
}
