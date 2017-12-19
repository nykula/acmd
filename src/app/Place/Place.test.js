const assign = require("lodash/assign");
const expect = require("expect");
const { createSpy } = require("expect");
const { RefService } = require("../Ref/RefService");
const { Place } = require("./Place");

describe("Place", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActivePlace: () => ({
        canUnmount: false,
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "GICON",
        name: "System",
        rootUri: "file:///media/System",
        uuid: false,
      }),
    };

    /** @type {any} */
    const placeService = {
      status: () => "",
    };

    new Place({
      panelId: 0,
      panelService,
      placeService,
    }).render();
  });

  it("dispatches levelUp", () => {
    /**
     * @type {any}
     */
    const panelService = {
      levelUp: createSpy().andReturn(undefined),
    };

    new Place({
      panelId: 0,
      panelService,
    }).handleLevelUp();

    expect(panelService.levelUp).toHaveBeenCalled();
  });
});
