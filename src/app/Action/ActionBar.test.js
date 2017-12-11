const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { find, shallow } = require("../Test/Test");
const { ActionBar } = require("./ActionBar");

describe("ActionBar", () => {
  it("dispatches action without payload", () => {
    const handler = expect.createSpy();

    /** @type {any} */
    const actionService = {
      get: () => ({ handler }),
    };

    const tree = shallow(h(ActionBar, { actionService }));
    const button = find(tree, x => x.type === "button");

    button.props.on_pressed();
    expect(handler).toHaveBeenCalledWith();
  });
});
