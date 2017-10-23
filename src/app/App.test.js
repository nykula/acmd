
const noop = require("lodash/noop");
const App = require("./App");
const { Services } = require("./Services");

it("renders virtual dom without crashing", () => {
  const win = { destroy: noop };
  const services = new Services(win);
  App.render(services);
});
