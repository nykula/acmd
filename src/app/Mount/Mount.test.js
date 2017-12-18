const assign = require("lodash/assign");
const expect = require("expect");
const { createSpy } = require("expect");
const { Place } = require("../../domain/Place/Place");
const { RefService } = require("../Ref/RefService");
const { Mount } = require("./Mount");

describe("Mount", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActiveTab: () => 0,
    };

    /** @type {Place} */
    const place = {
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: "computer",
      iconType: "GICON",
      name: "System",
      rootUri: "file:///media/System",
      uuid: null,
    };

    /** @type {any} */
    const placeService = {
      getActive: () => place,

      places: [place],

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
