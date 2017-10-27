const expect = require("expect");
const { PlaceService } = require("./PlaceService");

describe("PlaceService", () => {
  it("saves places, ordered by name", () => {
    const placeService = new PlaceService();

    const places = [
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "abc",
        rootUri: null,
        uuid: null,
      },
      {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "System",
        rootUri: "file:///media/System",
        uuid: null,
      },
    ];

    placeService.set(places);

    expect(placeService.names.slice()).toEqual(["/", "System", "abc"]);

    expect(placeService.entities).toEqual({
      "/": {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
      abc: {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "abc",
        rootUri: null,
        uuid: null,
      },
      System: {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "drive-harddisk",
        iconType: "ICON_NAME",
        name: "System",
        rootUri: "file:///media/System",
        uuid: null,
      },
    });
  });
});
