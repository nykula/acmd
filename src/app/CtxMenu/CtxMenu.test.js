const expect = require("expect");
const Refstore = require("../Refstore/Refstore").default;
const { CtxMenu } = require("./CtxMenu");

describe("CtxMenu", () => {
  it("renders", () => {
    /** @type {*} */
    const actionService = {
      getActiveFiles: () => [
        undefined,
        { uri: undefined },
        { uri: "file:///foo.bar" },
      ],
    };

    /** @type {*} */
    const fileService = {
      handlers: [{}],
    };

    /** @type {*} */
    const refstore = {};

    new CtxMenu({
      actionService,
      fileService,
      refstore,
    }).render();
  });

  it("refs", () => {
    const refstore = new Refstore();
    const node = {};

    new CtxMenu({
      actionService: undefined,
      fileService: undefined,
      refstore,
    }).ref(node);

    expect(refstore.get("ctxMenu")).toBe(node);
  });
});
