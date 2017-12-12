const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const Panel = require("./Panel").default;

describe("Panel", () => {
  it("renders without crashing", () => {
    shallow(h(Panel, { id: 0 }));
  });
});
