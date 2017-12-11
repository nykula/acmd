const expect = require("expect");
const h = require("inferno-hyperscript").default;
const { observable } = require("mobx");
const { Location } = require("./Location");
const { shallow } = require("../Test/Test");

describe("Location", () => {
  it("renders without crashing", () => {
    const panelService = {
      entities: {
        "0": {
          activeTabId: 0,
        },
      },
    };

    const tabService = {
      entities: {
        "0": {
          location: "file:///",
        },
      },
    };

    shallow(
      h(Location, {
        panelId: 0,
        panelService: panelService,
        tabService: tabService,
      }),
    );
  });

  it("selects row when isActive becomes true", () => {
    /** @type {any} */
    const panelService = observable({
      activeId: 1,
    });

    /** @type {any} */
    const tabService = {};

    const instance = new Location({
      panelId: 0,
      panelService: panelService,
      tabService: tabService,
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

    /** @type {any} */
    const tabService = {};

    const instance = new Location({
      panelId: 0,
      panelService: panelService,
      tabService: tabService,
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

  it("maps state to expected props", () => {
    /** @type {any} */
    const panelService = {
      activeId: 0,
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    /** @type {any} */
    const tabService = {
      entities: {
        "0": { location: "file:///" },
        "1": { location: "file:///media" },
      },
    };

    const instance = new Location({
      panelId: 0,
      panelService: panelService,
      tabService: tabService,
    });

    expect(instance.isActive()).toBeTruthy();
    expect(instance.tab().location).toBe("file:///");
  });
});
