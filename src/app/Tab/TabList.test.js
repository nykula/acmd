const assign = require("lodash/assign");
const h = require("inferno-hyperscript").default;
const { shallow } = require("../Test/Test");
const { TabList } = require("./TabList");

describe("TabList", () => {
  it("renders without crashing", () => {
    const panelService = {
      entities: {
        "0": {
          activeTabId: 0,
          tabIds: [0, 1],
        },
      },
    };

    shallow(
      h(TabList, {
        panelId: 0,
        panelService: panelService,
      }),
    );
  });
});
