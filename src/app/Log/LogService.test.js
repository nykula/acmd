const expect = require("expect");
const { LogService } = require("./LogService");

describe("LogService", () => {
  it("logs", () => {
    const debug = expect.createSpy().andReturn(undefined);
    const logService = new LogService(debug);
    logService.log("Foo", { bar: [1, "baz"] });
    expect(debug).toHaveBeenCalledWith(`Foo: {"bar":[1,"baz"]}`);
  });
});
