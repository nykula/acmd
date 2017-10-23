const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { find, shallow } = require("../Test/Test");
const { ActionBar } = require("./ActionBar");

describe("ActionBar", () => {
  it("dispatches action without payload", () => {
    const views = [];
    const actionService = {
      view: function() {
        views.push(arguments.length);
      },
    };

    const tree = shallow(h(ActionBar, { actionService: actionService }));
    const button = find(tree, x => x.type === "button");

    button.props.on_pressed();
    expect(views).toEqual([0]);
  });
});
