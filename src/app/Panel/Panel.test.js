const h = require("inferno-hyperscript").default;
const Panel = require("./Panel").default;
const { shallow } = require("../Test/Test");

it("renders without crashing", () => {
  shallow(h(Panel, { id: 0 }));
});
