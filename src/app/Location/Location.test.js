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
    /** @type {*} */
    const panelService = observable({
      activeId: 1,
    });

    /** @type {*} */
    const tabService = {};

    const instance = new Location({
      panelId: 0,
      panelService: panelService,
      tabService: tabService,
    });

    panelService.activeId = 0;

    const selectRow = expect.createSpy().andReturn(undefined);
    const row = {};

    instance.refRow(row);
    instance.refList({ select_row: selectRow });

    expect(selectRow).toHaveBeenCalledWith(row);
  });

  it("unselects row when isActive becomes false", () => {
    /** @type {*} */
    const panelService = observable({
      activeId: 0,
      entities: {},
    });

    /** @type {*} */
    const tabService = {};

    const instance = new Location({
      panelId: 0,
      panelService: panelService,
      tabService: tabService,
    });

    panelService.activeId = 1;

    const unselectRow = expect.createSpy().andReturn(undefined);
    const row = {};

    instance.refRow(row);
    instance.refList({ unselect_row: unselectRow });

    expect(unselectRow).toHaveBeenCalledWith(row);
  });

  it("maps state to expected props", () => {
    /** @type {*} */
    const panelService = {
      activeId: 0,
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    /** @type {*} */
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
