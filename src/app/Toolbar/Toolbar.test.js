const expect = require("expect");
const { Toolbar } = require("./Toolbar");
const h = require("inferno-hyperscript").default;
const { shallow } = require("../Test/Test");

describe("Toolbar", () => {
  it("dispatches action without payload", () => {
    const actions = [];

    const actionService = {
      refresh: function() {
        actions.push(arguments.length);
      },
    };

    const tabService = {
      showHidSys: false,
    };

    const tree = shallow(
      h(Toolbar, {
        actionService,
        tabService,
      }),
    );

    tree.children[0].props.on_pressed();
    expect(actions).toEqual([0]);
  });
});
