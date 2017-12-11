const expect = require("expect");
const { PlacesEntry } = require("./PlacesEntry");

describe("PlacesEntry", () => {
  it("renders entry without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActiveMountUri: () => "file:///",
    };

    new PlacesEntry({
      panelId: 0,
      panelService,
      place: {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
      placeService: undefined,
      short: "/",
    }).render();

    new PlacesEntry({
      panelId: 0,
      panelService,
      place: {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "media-optical",
        iconType: "ICON_NAME",
        name: "Music",
        rootUri: "file:///media/Music",
        uuid: null,
      },
      placeService: undefined,
      short: "M",
    }).render();
  });
});
