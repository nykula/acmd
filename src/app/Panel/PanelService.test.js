const expect = require("expect");
const { PanelService } = require("./PanelService");

describe("PanelService", () => {
  it("switches active tab in panel", () => {
    /** @type {any} */
    const tabService = undefined;

    const panelService = new PanelService(tabService);

    const entities = {
      "0": { activeTabId: 0 },
    };
    panelService.entities = entities;

    panelService.setActiveTabId({
      id: 0,
      tabId: 1,
    });

    expect(panelService.entities).toEqual({
      "0": { activeTabId: 1 },
    });
  });

  it("switches panel to next tab", () => {
    /** @type {any} */
    const tabService = undefined;

    const panelService = new PanelService(tabService);

    const entities = {
      "0": {
        activeTabId: 0,
        tabIds: [0, 2, 8],
      },
    };
    panelService.entities = entities;

    panelService.nextTab(0);
    expect(panelService.entities[0].activeTabId).toBe(2);

    panelService.nextTab(0);
    expect(panelService.entities[0].activeTabId).toBe(8);

    panelService.nextTab(0);
    expect(panelService.entities[0].activeTabId).toBe(0);
  });

  it("switches panel to prev tab", () => {
    /** @type {any} */
    const tabService = undefined;

    const panelService = new PanelService(tabService);

    const entities = {
      "0": {
        activeTabId: 0,
        tabIds: [0, 2, 8],
      },
    };
    panelService.entities = entities;

    panelService.prevTab(0);
    expect(panelService.entities[0].activeTabId).toBe(8);

    panelService.prevTab(0);
    expect(panelService.entities[0].activeTabId).toBe(2);

    panelService.prevTab(0);
    expect(panelService.entities[0].activeTabId).toBe(0);
  });

  it("removes tab in panel", () => {
    /** @type {any} */
    const tabService = undefined;

    const panelService = new PanelService(tabService);

    const entities = {
      "0": {
        activeTabId: 0,
        tabIds: [0],
      },
      "1": {
        activeTabId: 1,
        tabIds: [1, 2],
      },
    };
    panelService.entities = entities;

    panelService.removeTab(1);

    expect(panelService.entities).toMatch({
      "1": {
        activeTabId: 2,
        tabIds: [2],
      },
    });
  });

  it("toggles active panel", () => {
    /** @type {any} */
    const tabService = undefined;

    const panelService = new PanelService(tabService);
    panelService.activeId = 0;

    panelService.toggleActive();
    expect(panelService.activeId).toBe(1);

    panelService.toggleActive();
    expect(panelService.activeId).toBe(0);
  });
});
