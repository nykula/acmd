const { DragAction } = imports.gi.Gdk;
const expect = require("expect");
const { h } = require("../Gjs/GtkInferno");
const { find, shallow } = require("../Test/Test");
const { ActionBarRm } = require("./ActionBarRm");

describe("ActionBarRm", () => {
  it("renders", () => {
    new ActionBarRm({
      jobService: undefined,
      label: "",
      panelService: undefined,
      selectionService: undefined,
    }).render();
  });

  it("enables drop", () => {
    const node = {
      drag_dest_add_uri_targets: expect.createSpy(),
      drag_dest_set: expect.createSpy(),
    };

    new ActionBarRm({
      jobService: undefined,
      label: "",
      panelService: undefined,
      selectionService: undefined,
    }).ref(node);

    expect(node.drag_dest_set).toHaveBeenCalled();
    expect(node.drag_dest_add_uri_targets).toHaveBeenCalled();
  });

  it("removes dropped files", () => {
    /** @type {any} */
    const jobService = {
      run: expect.createSpy(),
    };

    /** @type {any} */
    const selectionData = {
      get_uris: () => ["file:///foo.bar"],
    };

    /** @type {any} */
    const panelService = {
      refresh: expect.createSpy(),
    };

    new ActionBarRm({
      jobService,
      label: "",
      panelService,
      selectionService: undefined,
    }).handleDrop(undefined, undefined, 0, 0, selectionData);

    expect(jobService.run).toHaveBeenCalledWith({
      destUri: "",
      type: "rm",
      uris: ["file:///foo.bar"],
    }, panelService.refresh);
  });

  it("removes selected files on click", () => {
    /** @type {any} */
    const selectionService = {
      rm: expect.createSpy(),
    };

    const button = shallow(h(ActionBarRm, { selectionService }));
    button.props.on_pressed();

    expect(selectionService.rm).toHaveBeenCalled();
  });
});
