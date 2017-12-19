const expect = require("expect");
const { observable } = require("mobx");
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { Location } = require("./Location");

describe("Location", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({
        location: "file:///",
      }),
    };

    shallow(
      h(Location, {
        panelId: 0,
        panelService,
      }),
    );
  });

  it("selects row when isActive becomes true", () => {
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
    const row = {};

    instance.refRow(row);

    /** @type {any} */
    const list = {
      select_row: expect.createSpy().andReturn(undefined),
    };

    instance.refList(list);

    expect(list.select_row).toHaveBeenCalledWith(row);
  });

  it("unselects row when isActive becomes false", () => {
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
    const row = {};

    instance.refRow(row);

    /** @type {any} */
    const list = {
      unselect_row: expect.createSpy().andReturn(undefined),
    };

    instance.refList(list);

    expect(list.unselect_row).toHaveBeenCalledWith(row);
  });
});
