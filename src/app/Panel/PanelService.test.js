const { FileType } = imports.gi.Gio;
const expect = require("expect");
const { toJS } = require("mobx");
const { TabService } = require("../Tab/TabService");
const { EmptyProps } = require("../Test/Test");
const { PanelService } = require("./PanelService");

describe("PanelService", () => {
  it("creates tab, cloning active tab in active panel", () => {
    /** @type {any[]} */
    const files = [{ name: "foo" }, { name: "bar" }];

    const tabService = new TabService(EmptyProps);
    tabService.entities[0] = {
      cursor: 1,
      files,
      location: "file:///",
      selected: [],
      sortedBy: "-date",
    };

    const panelService = new PanelService({ tabService });
    panelService.activeId = 0;
    panelService.entities[0] = {
      activeTabId: 0,
      history: [],
      now: 0,
      tabIds: [0],
    };
    panelService.createTab();

    expect(panelService.entities[0]).toMatch({
      activeTabId: 2,
      tabIds: [0, 2],
    });

    expect(toJS(tabService.entities[2])).toMatch({
      cursor: 1,
      files,
      location: "file:///",
      selected: [],
      sortedBy: "-date",
    });
  });

  it("lists files", () => {
    /** @type {any} */
    const tabService = {
      ls: function() {
        arguments[arguments.length - 1]();
      },
    };

    const panelService = new PanelService({ tabService });

    panelService.entities[0].activeTabId = 0;
    panelService.entities[0].history = ["file:///"];
    panelService.entities[0].now = 0;
    panelService.ls("file:///tmp", 0);

    expect(panelService.entities[0].history.length).toBe(2);
    expect(panelService.entities[0].now).toBe(1);
  });

  it("switches panel to next tab", () => {
    const panelService = new PanelService({});

    const entities = {
      "0": {
        activeTabId: 0,
        tabIds: [0, 2, 8],
      },
    };
    panelService.entities = entities;

    panelService.nextTab();
    expect(panelService.entities[0].activeTabId).toBe(2);

    panelService.nextTab();
    expect(panelService.entities[0].activeTabId).toBe(8);

    panelService.nextTab();
    expect(panelService.entities[0].activeTabId).toBe(0);
  });

  it("switches panel to prev tab", () => {
    const panelService = new PanelService({});

    panelService.activeId = 0;
    panelService.entities[0].activeTabId = 0;
    panelService.entities[0].tabIds = [0, 2, 8];

    panelService.prevTab();
    expect(panelService.entities[0].activeTabId).toBe(8);

    panelService.prevTab();
    expect(panelService.entities[0].activeTabId).toBe(2);

    panelService.prevTab();
    expect(panelService.entities[0].activeTabId).toBe(0);
  });

  it("removes tab, active if no id", () => {
    const panelService = new PanelService({});

    panelService.activeId = 1;
    panelService.entities[1].activeTabId = 1;
    panelService.entities[1].tabIds = [1, 2];

    panelService.removeTab();

    expect(panelService.entities[1].activeTabId).toBe(2);
    expect(toJS(panelService.entities[1].tabIds)).toEqual([2]);
  });

  it("removes tab", () => {
    const panelService = new PanelService({});

    panelService.activeId = 1;
    panelService.entities[1].activeTabId = 1;
    panelService.entities[1].tabIds = [1, 2];

    panelService.removeTab(1);

    expect(panelService.entities[1].activeTabId).toBe(2);
    expect(toJS(panelService.entities[1].tabIds)).toEqual([2]);
  });

  it("sets active tab", () => {
    const panelService = new PanelService({});

    panelService.entities[0].activeTabId = -1;

    panelService.setActiveTab(0);

    expect(panelService.entities[0].activeTabId).toBe(0);
  });

  it("toggles active panel", () => {
    const panelService = new PanelService({});
    panelService.activeId = 0;

    panelService.toggleActive();
    expect(panelService.activeId).toBe(1);

    panelService.toggleActive();
    expect(panelService.activeId).toBe(0);
  });
});
