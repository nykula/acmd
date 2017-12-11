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

    new CtxMenuHandler({
      gioService,
      handler,
      iconSize: 16,
      uris,
    }).handleActivate();

    expect(gioService.launch).toHaveBeenCalledWith(handler, uris);
  });
});
