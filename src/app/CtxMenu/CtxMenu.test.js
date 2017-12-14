const expect = require("expect");
const { RefService } = require("../Ref/RefService");
const { CtxMenu } = require("./CtxMenu");

describe("CtxMenu", () => {
  it("renders", () => {
    const refService = new RefService();

    /** @type {any} */
    const selectService = {
      getUris: () => ["file:///foo.bar"],
      handlers: [{}],
    };

    new CtxMenu({
      refService,
      selectService,
    }).render();
  });
});
