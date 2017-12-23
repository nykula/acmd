const expect = require("expect");
const { CtxMenuHandler } = require("./CtxMenuHandler");

describe("CtxMenuHandler", () => {
  it("renders", () => {
    /** @type {any} */
    const gioService = {};

    new CtxMenuHandler({
      gioService,
      handler: {
        commandline: "/usr/share/code/code --unity-launch %U",
        displayName: "Visual Studio Code",
        icon: "code",
      },
      iconSize: 16,
      uris: ["file:///foo.bar"],
    }).render();
  });

  it("handles activate", () => {
    /** @type {any} */
    const gioService = {
      launch: expect.createSpy(),
    };

    const handler = {
      commandline: "/usr/share/code/code --unity-launch %U",
      displayName: "Visual Studio Code",
      icon: "code",
    };

    const uris = ["file:///foo.bar"];

    /** @type {any} */
    const menuItem = {
      /**
       * @param {"activate"} _
       * @param {() => void} callback
       */
      connect: (_, callback) => callback(),
    };

    new CtxMenuHandler({
      gioService,
      handler,
      iconSize: 16,
      uris,
    }).ref(menuItem);

    expect(gioService.launch).toHaveBeenCalledWith(handler, uris);
  });

  it("refs null", () => {
    const handler = {
      commandline: "/usr/share/code/code --unity-launch %U",
      displayName: "Visual Studio Code",
      icon: "code",
    };

    const uris = ["file:///foo.bar"];

    new CtxMenuHandler({
      handler,
      iconSize: 16,
      uris,
    }).ref(null);
  });
});
