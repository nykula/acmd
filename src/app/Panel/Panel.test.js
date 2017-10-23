const h = require("inferno-hyperscript").default;
const Panel = require("./Panel").default;
const { shallow } = require("../Test/Test");

describe("Panel", () => {
  it("renders without crashing", () => {
    shallow(h(Panel, { id: 0 }));
  });
});
