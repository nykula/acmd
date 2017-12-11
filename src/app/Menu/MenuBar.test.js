const expect = require("expect");
const { MenuBar } = require("./MenuBar");

describe("MenuBar", () => {
  it("renders without crashing", () => {
    const handler = expect.createSpy();

    /** @type {any} */
    const actionService = {
      get: () => ({ handler }),
    };

    new MenuBar({ actionService }).render();
  });

  it("calls action when user activates item", () => {
    const handler = expect.createSpy();

    /** @type {any} */
    const actionService = {
      get: () => ({ handler }),
    };

    /** @type {any} */
    const tree = new MenuBar({ actionService }).render();

    tree.children[0].children[0].props.on_activate();

    expect(handler).toHaveBeenCalled();
  });
});
