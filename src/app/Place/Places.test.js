const h = require("inferno-hyperscript").default;
const { shallow } = require("../Test/Test");
const { Places } = require("./Places");

describe("Places", () => {
  it("renders without crashing", () => {
    const placeService = {
      entities: {
        Music: {
          icon: "media-optical",
          iconType: "ICON_NAME",
          name: "Music",
          rootUri: "file:///media/Music",
        },
        System: {
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          name: "System",
          rootUri: "file:///media/System",
        },
      },
      names: ["System", "Music"],
    };

    const panelService = {
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    const tabService = {
      entities: {
        "0": {
          files: [
            {
              mountUri: "file:///media/System",
              name: ".",
            },
          ],
          location: "file:///media/System/tmp",
        },
      },
    };

    shallow(
      h(Places, {
        panelId: 0,
        panelService: panelService,
        placeService: placeService,
        tabService: tabService,
      }),
    );
  });
});
