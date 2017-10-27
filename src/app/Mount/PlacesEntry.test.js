const expect = require("expect");
const { PlacesEntry } = require("./PlacesEntry");

describe("PlacesEntry", () => {
  it("renders entry without crashing", () => {
    /** @type {*} */
    const panelService = {
      entities: {
        "0": {
          activeTabId: 0,
        },
      },
    };

    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          files: [{ mountUri: "file:///", name: "." }],
          location: "",
        },
      },
    };

    new PlacesEntry({
      actionService: undefined,
      panelId: 0,
      panelService: panelService,
      place: {
        filesystemFree: 0,
        filesystemSize: 0,
        name: "/",
        icon: "computer",
        iconType: "ICON_NAME",
        rootUri: "file:///",
        uuid: null,
      },
      short: "/",
      tabService: tabService,
    }).render();

    new PlacesEntry({
      actionService: undefined,
      panelId: 0,
      panelService: panelService,
      place: {
        filesystemFree: 0,
        filesystemSize: 0,
        name: "Music",
        icon: "media-optical",
        iconType: "ICON_NAME",
        rootUri: "file:///media/Music",
        uuid: null,
      },
      short: "M",
      tabService: tabService,
    }).render();
  });

  it("does not show context menu on active entry click", () => {
    const ctxMenu = expect.createSpy().andReturn(undefined);

    /** @type {*} */
    const actionService = {
      ctxMenu: ctxMenu,
    };

    /** @type {*} */
    const panelService = {
      entities: {
        "0": {
          activeTabId: 0,
        },
      },
    };

    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          files: [{ mountUri: "file:///", name: "." }],
          location: "",
        },
      },
    };

    new PlacesEntry({
      actionService: actionService,
      panelId: 0,
      panelService: panelService,
      place: {
        filesystemFree: 0,
        filesystemSize: 0,
        name: "/",
        icon: "computer",
        iconType: "ICON_NAME",
        rootUri: "file:///",
        uuid: null,
      },
      short: "/",
      tabService: tabService,
    })
      .handleClicked();

    expect(ctxMenu.calls.length).toBe(0);
  });
});
