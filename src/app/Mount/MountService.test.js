const expect = require("expect");
const { MountService } = require("./MountService");

describe("MountService", () => {
  it("saves mounts when ready", () => {
    const mountService = new MountService();

    mountService.set({
      drives: [
        {
          volumes: [
            {
              mount: null,
              identifiers: {
                uuid: "abc",
              },
            },
            {
              mount: {
                name: "System",
                icon: "drive-harddisk",
                iconType: "ICON_NAME",
                rootUri: "file:///media/System",
                attributes: {},
              },
            },
          ],
        },
      ],
      mounts: [
        {
          name: "/",
          icon: "computer",
          iconType: "ICON_NAME",
          rootUri: "file:///",
          attributes: {},
        },
        {
          name: "abc",
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          rootUri: null,
          attributes: {},
        },
        {
          name: "System",
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          rootUri: "file:///media/System",
          attributes: {},
        },
      ],
    });

    expect(mountService).toMatch({
      names: ["/", "System", "abc"],
      entities: {
        "/": {
          name: "/",
          icon: "computer",
          iconType: "ICON_NAME",
          rootUri: "file:///",
          attributes: {},
        },
        abc: {
          name: "abc",
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          rootUri: null,
          uuid: "abc",
          attributes: {},
        },
        System: {
          name: "System",
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          rootUri: "file:///media/System",
          attributes: {},
        },
      },
    });
  });
});
