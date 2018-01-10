const expect = require("expect");
const { PlacesEntry } = require("./PlacesEntry");

describe("PlacesEntry", () => {
  it("renders entry without crashing", () => {
    const place = {
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///",
      uuid: "",
    };

    /** @type {any} */
    const panelService = {
      getActivePlace: () => place,
    };

    /** @type {any} */
    const placeService = {
      shortNames: {
        "/": "/",
        "Music": "M",
      },

      status: () => "",
    };

    new PlacesEntry({
      panelId: 0,
      panelService,
      place,
      placeService,
    }).render();

    new PlacesEntry({
      panelId: 0,
      panelService,
      place: {
        canUnmount: true,
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "media-optical",
        iconType: "ICON_NAME",
        isShadowed: false,
        name: "Music",
        rootUri: "file:///media/Music",
        uuid: "",
      },
      placeService,
    }).render();
  });
});
