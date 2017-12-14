const expect = require("expect");
const { PlacesEntry } = require("./PlacesEntry");

describe("PlacesEntry", () => {
  it("renders entry without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActiveMountUri: () => "file:///",
    };

    /** @type {any} */
    const placeService = {
      entities: {
        "/": {
          filesystemFree: 0,
          filesystemSize: 0,
          icon: "computer",
          iconType: "ICON_NAME",
          name: "/",
          rootUri: "file:///",
          uuid: "",
        },

        "Music": {
          filesystemFree: 0,
          filesystemSize: 0,
          icon: "media-optical",
          iconType: "ICON_NAME",
          name: "Music",
          rootUri: "file:///media/Music",
          uuid: "",
        },
      },

      shortNames: {
        "/": "/",
        "Music": "M",
      },
    };

    new PlacesEntry({
      name: "/",
      panelId: 0,
      panelService,
      placeService,
    }).render();

    new PlacesEntry({
      name: "Music",
      panelId: 0,
      panelService,
      placeService,
    }).render();
  });
});
