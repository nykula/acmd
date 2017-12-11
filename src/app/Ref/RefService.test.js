const expect = require("expect");
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { RefService } = require("./RefService");
const { render } = require("inferno");

describe("RefService", () => {
  it("stores reference", () => {
    const refService = new RefService();
    const node = {};
    refService.set("panel0DirTree")(node);
    expect(refService.get("panel0DirTree")).toBe(node);
  });

  it("returns same setter for same key", () => {
    const refService = new RefService();
    const setter = refService.set("panel1DirTree");
    expect(refService.set("panel1DirTree")).toBe(setter);
    expect(refService.set("panel0DirTree")).toNotBe(setter);
  });
});
