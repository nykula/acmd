const noop = require("lodash/noop");
const App = require("./App");
const { Services } = require("./Services");

describe("App", () => {
  it("creates sevices without crashing", () => {
    /** @type {any} */
    const win = { destroy: noop };
    const services = new Services(win);
    services.windowService.exit();
  });

  it("renders layout without crashing", () => {
    App.render();
  });
});
