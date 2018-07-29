const expect = require("expect");
const { Toolbar } = require("./Toolbar");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");

describe("Toolbar", () => {
  it("dispatches action without payload", () => {
    const handler = expect.createSpy();

    /** @type {any} */
    const actionService = {
      get: () => ({ handler }),
    };

    /** @type {any} */
    const tabService = {
      showHidSys: false,
    };

    const tree = shallow(
      h(Toolbar, {
        actionService,
        tabService,
      }),
    );

    tree.children[0].props.pressedCallback();
    expect(handler).toHaveBeenCalledWith();
  });
});
