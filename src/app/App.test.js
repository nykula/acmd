const noop = require("lodash/noop");
const App = require("./App");
const { Services } = require("./Services");

describe("App", () => {
  it("creates sevices without crashing", () => {
    const win = { destroy: noop };
    const services = new Services(win);
    services.win.destroy();
  });

  it("renders layout without crashing", () => {
    App.render();
  });
});
