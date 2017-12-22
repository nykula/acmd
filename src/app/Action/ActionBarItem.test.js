const expect = require("expect");
const { ActionBarItem } = require("./ActionBarItem");

describe("ActionBarItem", () => {
  it("renders", () => {
    const action = {
      id: "windowService.exit",
      label: "Exit",
      shortcut: "Alt+F4",
    };

    new ActionBarItem({ action }).render();
  });

  it("renders rm", () => {
    const action = {
      id: "selectService.rm",
      label: "Delete",
      shortcut: "F8",
    };

    new ActionBarItem({ action }).render();
  });

  it("connects handler", () => {
    const handler = expect.createSpy();

    /** @type {any} */
    const actionService = {
      get: () => ({ handler }),
    };

    /** @type {any} */
    const button = {
      connect: expect.createSpy(),
    };

    const action = {
      id: "windowService.exit",
      label: "Exit",
      shortcut: "Alt+F4",
    };

    new ActionBarItem({ action, actionService }).ref(button);
    expect(button.connect).toHaveBeenCalledWith("pressed", handler);
  });

  it("refs null", () => {
    const action = {
      id: "windowService.exit",
      label: "Exit",
      shortcut: "Alt+F4",
    };

    new ActionBarItem({ action }).ref(null);
  });
});
