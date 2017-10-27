const assign = require("lodash/assign");
const expect = require("expect");
const { createSpy } = require("expect");
const { Mount } = require("./Mount");

describe("Mount", () => {
  it("renders without crashing", () => {
    /** @type {*} */
    const placeService = {
      names: ["System"],
      entities: {
        System: {
          filesystemFree: 0,
          filesystemSize: 0,
          name: "System",
          rootUri: "file:///media/System",
        },
      },
    };

    /** @type {*} */
    const panelService = {
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          files: [{
            mountUri: "file:///media/System",
            name: ".",
          }],
        },
      },
    };

    new Mount({
      actionService: undefined,
      panelId: 0,
      panelService,
      placeService,
      refstore: undefined,
      tabService,
    }).render();
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
      panelId: 0,
      panelService: undefined,
      placeService: undefined,
      refstore: undefined,
      tabService: undefined,
    })
      .handleLevelUp();

    expect(levelUp.calls.length).toBe(1);
  });
});
