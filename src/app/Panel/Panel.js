const { Orientation, PolicyType } = imports.gi.Gtk;
const h = require("inferno-hyperscript").default;
const Directory = require("../Directory/Directory").default;
const Location = require("../Location/Location").default;
const Mount = require("../Mount/Mount").default;
const Stats = require("../Stats/Stats").default;
const TabList = require("../Tab/TabList").default;

exports.default = Panel;
/**
 * @param {{ id: string }} props
 */
function Panel(props) {
  const panelId = props.id;

  return (
    h("box", { orientation: Orientation.VERTICAL }, [
      h(Mount, {
        key: "MOUNT",
        panelId,
      }),
      h(TabList, {
        key: "TAB_LIST",
        panelId,
      }),
      h("h-separator"),
      h(Location, {
        key: "LOCATION",
        panelId,
      }),
      h("h-separator"),
      h("scrolled-window", {
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
