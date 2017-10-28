const expect = require("expect");
const { MenuBar } = require("./MenuBar");

describe("MenuBar", () => {
  it("renders without crashing", () => {
    /** @type {*} */
    const actionService = {};

    new MenuBar({ actionService }).render();
  });

  it("calls action when user activates item", () => {
    /** @type {*} */
    const actionService = {
      createTab: expect.createSpy(),
    };

    const tree = new MenuBar({ actionService }).render();

    tree.children[0].children[0].props.on_activate();

    expect(actionService.createTab).toHaveBeenCalled();
  });
});
