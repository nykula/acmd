const assign = require("lodash/assign");
const expect = require("expect");
const { createSpy } = require("expect");
const h = require("inferno-hyperscript").default;
const { Mount } = require("./Mount");
const { shallow } = require("../Test/Test");

describe("Mount", () => {
  it("renders without crashing", () => {
    const mountService = {
      names: ["System"],
      entities: {
        System: {
          name: "System",
          attributes: { "filesystem::size": 1 },
          rootUri: "file:///media/System",
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
          files: [{
            name: ".",
            mountUri: "file:///media/System",
          }],
        },
      },
    };

    shallow(
      h(Mount, {
        mountService: mountService,
        panelId: 0,
        panelService: panelService,
        tabService: tabService,
      }),
    );
  });

  it("dispatches levelUp", () => {
    const levelUp = createSpy().andReturn(undefined);

    /**
     * @type {*}
     */
    const actionService = {
      levelUp: levelUp,
    };

    new Mount({
      actionService: actionService,
      mountService: undefined,
      panelId: 0,
      panelService: undefined,
      refstore: undefined,
      tabService: undefined,
    })
      .handleLevelUp();

    expect(levelUp.calls.length).toBe(1);
  });
});
