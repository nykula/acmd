const expect = require("expect");
const { toJS } = require("mobx");
const { Place } = require("../../domain/Place/Place");
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

    const panel = panelService.entities[0];
    expect(panel.activeTabId).toBe(2);
    expect(panel.tabIds).toEqual([0, 2]);

    const tab = tabService.entities[2];
    expect(tab.cursor).toBe(1);
    expect(tab.files.length).toEqual(files.length);
    expect(tab.files[0]).toEqual(files[0]);
    expect(tab.location).toBe("file:///");
    expect(tab.selected.length).toBe(0);
    expect(tab.sortedBy).toBe("-date");
  });

  it("opens location of source in destination", () => {
    /** @type {any} */
    const tabService = {
      entities: {
        0: { location: "file:///tmp" },
        1: {},
      },

      ls: expect.createSpy(),
    };

    const panelService = new PanelService({ tabService });
    panelService.setActiveTab(0);
    panelService.equal();

    expect(tabService.ls).toHaveBeenCalledWith(1, "file:///tmp");
  });

  it("lists files", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {any} */
    const placeService = {};

    /** @type {any} */
    const tabService = {
      ls: function() {
        arguments[arguments.length - 1]();
      },
    };

    const panelService = new PanelService({
      dialogService,
      placeService,
      tabService,
    });

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

  it("opens place, mounting if no root", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {Place} */
    const place = {
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
      iconType: "GICON",
      isShadowed: false,
      name: "System",
      rootUri: null,
      uuid: "random-uuid",
    };

    const handleUuid = expect.createSpy();

    /** @type {any} */
    const placeService = {
      getActive: () => false,

      /**
       * @param {string} uuid
       * @param {() => void} callback
       */
      mountUuid(uuid, callback) {
        handleUuid(uuid);
        place.rootUri = "file:///media/System";
        callback();
      },
    };

    const handleLocation = expect.createSpy();

    /** @type {any} */
    const tabService = {
      entities: {
        0: {},
        1: {},
      },

      /**
       * @param {number} _
       * @param {string} uri
       * @param {() => void} callback
       */
      ls(_, uri, callback) {
        handleLocation(uri);
        callback();
      },
    };

    const panelService = new PanelService({
      dialogService,
      placeService,
      tabService,
    });

    panelService.openPlace(0, place);

    expect(handleUuid).toHaveBeenCalledWith("random-uuid");
    expect(handleLocation).toHaveBeenCalledWith("file:///media/System");
  });

  it("opens place, taking location from other panel if same root", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {Place} */
    const otherPlace = {
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///",
      uuid: null,
    };

    /** @type {any} */
    const placeService = {
      getActive: () => otherPlace,
    };

    const handleLocation = expect.createSpy();

    /** @type {any} */
    const tabService = {
      entities: {
        0: {},
        1: { location: "file:///usr/share" },
      },

      /**
       * @param {number} _
       * @param {string} uri
       * @param {() => void} callback
       */
      ls(_, uri, callback) {
        handleLocation(uri);
        callback();
      },
    };

    const panelService = new PanelService({
      dialogService,
      placeService,
      tabService,
    });

    panelService.openPlace(0, otherPlace);
    expect(handleLocation).toHaveBeenCalledWith("file:///usr/share");
  });

  it("opens place", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {any} */
    const placeService = {
      getActive: () => false,
    };

    const handleLocation = expect.createSpy();

    /** @type {any} */
    const tabService = {
      entities: {
        0: {},
        1: {},
      },

      /**
       * @param {number} _
       * @param {string} uri
       * @param {() => void} callback
       */
      ls(_, uri, callback) {
        handleLocation(uri);
        callback();
      },
    };

    const panelService = new PanelService({
      dialogService,
      placeService,
      tabService,
    });

    /** @type {Place} */
    const place = {
      canUnmount: false,
      filesystemFree: 0,
      filesystemSize: 0,
      icon: "computer",
      iconType: "ICON_NAME",
      isShadowed: false,
      name: "/",
      rootUri: "file:///tmp",
      uuid: null,
    };

    panelService.openPlace(1, place);

    expect(panelService.activeId).toBe(1);
    expect(handleLocation).toHaveBeenCalledWith("file:///tmp");
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

  it("swaps", () => {
    /** @type {any} */
    const tabService = {
      entities: {
        0: { location: "file:///" },
        1: { location: "file:///tmp" },
      },

      ls: expect.createSpy(),
    };

    const panelService = new PanelService({ tabService });
    panelService.swap();

    expect(tabService.ls).toHaveBeenCalledWith(0, "file:///tmp");
    expect(tabService.ls).toHaveBeenCalledWith(1, "file:///");
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
