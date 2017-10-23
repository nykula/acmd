const h = require("inferno-hyperscript").default;
const { MountList } = require("./MountList");
const { shallow } = require("../Test/Test");

describe("MountList", () => {
  it("renders without crashing", () => {
    const mountService = {
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
    };

    const panelService = {
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    const tabService = {
      entities: {
        "0": {
          location: "file:///media/System/tmp",
          files: [{
            name: ".",
            mountUri: "file:///media/System",
          }],
        },
      },
    };

    shallow(
      h(MountList, {
        mountService: mountService,
        panelId: 0,
        panelService: panelService,
        tabService: tabService,
      }),
    );
  });
});
