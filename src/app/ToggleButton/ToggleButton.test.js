const expect = require("expect");
const { noop } = require("lodash");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const ToggleButton = require("./ToggleButton").default;

describe("ToggleButton", () => {
  it("renders without crashing", () => {
    shallow(h(ToggleButton, {
      active: false,
      pressedCallback: noop,
    }, []));
  });

  it("resets active on ref store", () => {
    const instance = new ToggleButton({ active: true });
    const { node } = setup();
    instance.ref(node);
    expect(node.active).toBe(true);
  });

  it("resets active on update", () => {
    const instance = new ToggleButton({ active: false });
    const { node } = setup();
    instance.ref(node);
    instance.componentDidUpdate();
    expect(node.active).toBe(false);
  });

  it("does not crash on reset attempt with null ref", () => {
    const instance = new ToggleButton({ active: false });
    instance.ref(null);
    instance.resetActive();
  });

  it("connects pressed", () => {
    const pressedCallback = expect.createSpy();
    const instance = new ToggleButton({ active: false, pressedCallback });
    const { node } = setup();
    instance.ref(node);
    expect(node.connect).toHaveBeenCalledWith("pressed", pressedCallback);
  });
});

function setup() {
  class Node {
    constructor() {
      this.active = null;
      this.connect = expect.createSpy();
      this.set_state_flags = () => { this.active = true; };
      this.unset_state_flags = () => { this.active = false; };
    }
  }

  return {
    node: /** @type {any} */ (new Node()),
  };
}
