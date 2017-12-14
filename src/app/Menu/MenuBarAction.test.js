const expect = require("expect");
const { MenuBarAction } = require("./MenuBarAction");

describe("MenuBarAction", () => {
  it("renders", () => {
    const action = {
      id: "selectService.copy",
      label: "Copy",
    };

    new MenuBarAction({ action }).render();
  });

  it("connects handler", () => {
    const handler = expect.createSpy();

    /** @type {any} */
    const actionService = {
      get: () => ({ handler }),
    };

    /** @type {any} */
    const menuItem = {
      connect: expect.createSpy(),
    };

    const action = {
      id: "selectService.copy",
      label: "Copy",
    };

    new MenuBarAction({ action, actionService }).ref(menuItem);
    expect(menuItem.connect).toHaveBeenCalledWith("activate", handler);
  });
});
