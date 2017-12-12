const assign = require("lodash/assign");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { TabList } = require("./TabList");

describe("TabList", () => {
  it("renders without crashing", () => {
    /** @type {any} */
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
        panelService,
      }),
    );
  });
});
