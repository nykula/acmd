const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { MountListEntry } = require("./MountListEntry");
const { shallow } = require("../Test/Test");

describe("MountListEntry", () => {
  it("renders entry without crashing", () => {
    const panelService = {
      entities: {
        "0": {
          activeTabId: 0,
        },
      },
    };

    const tabService = {
      entities: {
        "0": {
          files: [{ mountUri: "file:///", name: "." }],
          location: "",
        },
      },
    };

    shallow(
      h(MountListEntry, {
        mount: {
          name: "/",
          icon: "computer",
          iconType: "ICON_NAME",
          rootUri: "file:///",
        },
        panelId: 0,
        panelService: panelService,
        short: "/",
        tabService: tabService,
      }),
    );

    shallow(
      h(MountListEntry, {
        mount: {
          name: "Music",
          icon: "media-optical",
          iconType: "ICON_NAME",
          rootUri: "file:///media/Music",
        },
        panelId: 0,
        panelService: panelService,
        short: "M",
        tabService: tabService,
      }),
    );
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

    new MountListEntry({
      actionService: actionService,
      mount: {
        name: "/",
        icon: "computer",
        iconType: "ICON_NAME",
        rootUri: "file:///",
        uuid: "",
      },
      panelId: 0,
      panelService: panelService,
      short: "/",
      tabService: tabService,
    })
      .handleClicked();

    expect(ctxMenu.calls.length).toBe(0);
  });
});
