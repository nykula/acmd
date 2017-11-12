const expect = require("expect");
const { CtxMenuAction } = require("./CtxMenuAction");

describe("CtxMenuAction", () => {
  it("renders", () => {
    /** @type {*} */
    const actionService = {
      getActiveFiles: () => [
        undefined,
        { uri: undefined },
        { uri: "file:///foo.bar" },
      ],
    };

    new CtxMenuAction({
      action: "copy",
      actionService,
      icon: "edit-copy",
      iconSize: 16,
      label: "Copy",
    }).render();
  });

  it("handles activate", () => {
    /** @type {*} */
    const actionService = {
      copy: expect.createSpy(),
    };

    new CtxMenuAction({
      action: "copy",
      actionService,
      icon: "edit-copy",
      iconSize: 16,
      label: "Copy",
    }).handleActivate();

    expect(actionService.copy).toHaveBeenCalled();
  });
});
