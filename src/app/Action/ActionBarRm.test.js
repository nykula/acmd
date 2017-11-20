const { DragAction } = imports.gi.Gdk;
const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { find, shallow } = require("../Test/Test");
const { ActionBarRm } = require("./ActionBarRm");

describe("ActionBarRm", () => {
  it("renders", () => {
    new ActionBarRm({
      actionService: undefined,
      label: "",
    }).render();
  });

  it("enables drop", () => {
    const node = {
      drag_dest_add_uri_targets: expect.createSpy(),
      drag_dest_set: expect.createSpy(),
    };

    new ActionBarRm({
      actionService: undefined,
      label: "",
    }).ref(node);

    expect(node.drag_dest_set).toHaveBeenCalled();
    expect(node.drag_dest_add_uri_targets).toHaveBeenCalled();
  });

  it("removes files on drop", () => {
    /** @type {*} */
    const actionService = {
      rm: expect.createSpy(),
    };

    /** @type {*} */
    const selectionData = {
      get_uris: () => ["file:///foo.bar"],
    };

    new ActionBarRm({
      actionService,
      label: "",
    }).handleDrop(undefined, undefined, 0, 0, selectionData);

    expect(actionService.rm).toHaveBeenCalledWith(["file:///foo.bar"]);
  });

  it("shows confirm on click", () => {
    /** @type {*} */
    const actionService = {
      rm: expect.createSpy(),
    };

    const button = shallow(h(ActionBarRm, { actionService }));
    button.props.on_pressed();

    expect(actionService.rm).toHaveBeenCalledWith();
  });
});
