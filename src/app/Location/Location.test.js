const { StateFlags } = imports.gi.Gtk;
const expect = require("expect");
const { noop } = require("lodash");
const { observable } = require("mobx");
const { h } = require("../Gjs/GtkInferno");
const { UriService } = require("../Uri/UriService");
const { Location } = require("./Location");

describe("Location", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({
        location: "file:///",
      }),
    };

    new Location({
      panelId: 0,
      panelService,
      uriService: new UriService(),
    }).render();
  });

  it("selects when isActive becomes true", () => {
    /** @type {any} */
    const panelService = observable({
      activeId: 1,
    });

    const instance = new Location({
      panelId: 0,
      panelService,
    });

    panelService.activeId = 0;

    /** @type {any} */
    const box = {
      connect: noop,
      set_state_flags: expect.createSpy(),
    };

    instance.ref(box);

    expect(box.set_state_flags).toHaveBeenCalledWith(
      StateFlags.SELECTED,
      false,
    );

    instance.componentWillUnmount();
  });

  it("unselects when isActive becomes false", () => {
    /** @type {any} */
    const panelService = observable({
      activeId: 0,
      entities: {},
    });

    const instance = new Location({
      panelId: 0,
      panelService,
    });

    panelService.activeId = 1;

    /** @type {any} */
    const box = {
      connect: noop,
      unset_state_flags: expect.createSpy(),
    };

    instance.ref(box);

    expect(box.unset_state_flags).toHaveBeenCalledWith(StateFlags.SELECTED);

    instance.componentWillUnmount();
  });

  it("activates panel on click", () => {
    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({
        location: "file:///",
      }),

      setActive: expect.createSpy(),
    };

    /** @type {any} */
    const box = {
      connect: function() {
        arguments[arguments.length - 1]();
      },
    };

    new Location({
      panelId: 1,
      panelService,
      uriService: new UriService(),
    }).ref(box);

    expect(panelService.setActive).toHaveBeenCalledWith(1);
  });
});
