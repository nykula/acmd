const assign = require("lodash/assign");
const h = require("inferno-hyperscript").default;
const { Mount, MountList, mapStateToProps } = require("./MountList");
const { shallow } = require("../Test/Test");

it("renders without crashing", () => {
  shallow(h(MountList, assign(
    { panelId: 0 },
    mapStateToProps({
      entities: {
        panels: {
          "0": { activeTabId: 0 },
        },
        tabs: {
          "0": {
            location: "file:///media/System/tmp",
            files: [{
              name: ".",
              mountUri: "file:///media/System",
            }],
          },
        },
      },
      mounts: {
        names: ["System", "Music"],
        entities: {
          System: {
            name: "System",
            icon: "drive-harddisk",
            iconType: "ICON_NAME",
            rootUri: "file:///media/System",
          },
          Music: {
            name: "Music",
            icon: "media-optical",
            iconType: "ICON_NAME",
            rootUri: "file:///media/Music",
          },
        },
      },
    }, { panelId: 0 }),
  )));
});

it("renders item without crashing", () => {
  shallow(h(Mount, {
    mount: {
      name: "/",
      icon: "computer",
      iconType: "ICON_NAME",
      rootUri: "file:///",
    },
    isActive: true,
    short: "/",
  }));

  shallow(h(Mount, {
    mount: {
      name: "Music",
      icon: "media-optical",
      iconType: "ICON_NAME",
      rootUri: "file:///media/Music",
    },
    isActive: false,
    short: "M",
  }));
});

it("does not show context menu on active item click", () => {
  new Mount({
    location: "file:///",
    mount: {
      name: "/",
      icon: "computer",
      iconType: "ICON_NAME",
      rootUri: "file:///",
    },
    short: "/",
  }).handleClicked();
});
