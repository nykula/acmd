const assign = require("lodash/assign");
const expect = require("expect");
const { createSpy } = require("expect");
const { RefService } = require("../Ref/RefService");
const { Mount } = require("./Mount");

describe("Mount", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActiveMountUri: () => "file:///media/System",
    };

    /** @type {any} */
    const placeService = {
      entities: {
        System: {
          filesystemFree: 0,
          filesystemSize: 0,
          name: "System",
          rootUri: "file:///media/System",
        },
      },

      names: ["System"],

      shortNames: {
        "System": "S",
      },
    };

    new Mount({
      panelId: 0,
      panelService,
      placeService,
      refService: new RefService(),
    }).render();
  });

  it("dispatches levelUp", () => {
    /**
     * @type {any}
     */
    const panelService = {
      levelUp: createSpy().andReturn(undefined),
    };

    new Mount({
      panelId: 0,
      panelService,
      refService: new RefService(),
    }).handleLevelUp();

    expect(panelService.levelUp).toHaveBeenCalled();
  });
});
