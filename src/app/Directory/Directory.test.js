const { FileType } = imports.gi.Gio;
const expect = require("expect");
const h = require("inferno-hyperscript").default;
const assign = require("lodash/assign");
const { observable } = require("mobx");
const { createSpy } = expect;
const { Directory } = require("./Directory");
const { shallow } = require("../Test/Test");

describe("Directory", () => {
  it("renders without crashing", () => {
    const panelService = {
      activeId: 0,

      entities: {
        "0": { activeTabId: 0 },
      },
    };

    const tabService = {
      entities: {
        "0": {
          cursor: 0,
          selected: [],
          sortedBy: "-date",
        },
      },

      showHidSys: false,

      visibleFiles: {
        "0": [{
          fileType: FileType.REGULAR,
          icon: "some gio icon",
          iconType: "GICON",
          modificationTime: 1490397889,
          name: "foo.bar",
          size: 1000,
        }],
      },
    };

    shallow(
      h(Directory, {
        panelId: 0,
        panelService,
        tabService,
      }),
    );
  });

  it("prepends arrow to sorting column title", () => {
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
        "0": { sortedBy: "ext" },
      },
    };

    const instance = new Directory({
      actionService: undefined,
      fileService: undefined,
      panelId: 0,
      panelService,
      refstore: undefined,
      tabService,
    });

    tabService.entities[0].sortedBy = "ext";
    let col = instance.prefixSort({ name: "ext", title: "Ext" });
    expect(col.title).toBe("↑Ext");

    tabService.entities[0].sortedBy = "-date";
    col = instance.prefixSort({ name: "date", title: "Date" });
    expect(col.title).toBe("↓Date");

    tabService.entities[0].sortedBy = "name";
    col = instance.prefixSort({ name: "size", title: "Size" });
    expect(col.title).toBe("Size");
  });

  it("grabs focus when isActive becomes true", () => {
    /** @type {any} */
    const panelService = observable({
      activeId: 1,
      entities: {
        "0": {},
        "1": {},
      },
    });

    const instance = new Directory({
      actionService: undefined,
      fileService: undefined,
      panelId: 0,
      panelService,
      refstore: undefined,
      tabService: undefined,
    });

    panelService.activeId = 0;

    const grabFocus = createSpy().andReturn(undefined);

    instance.ref({ grab_focus: grabFocus });

    expect(grabFocus).toHaveBeenCalled();
  });

  it("dispatches actions without crashing", () => {
    const activated = createSpy().andReturn(undefined);

    /** @type {*} */
    const actionService = {
      activated: activated,
    };

    /** @type {*} */
    const panelService = {
      activeId: 0,
      entities: {
        "0": {
          activeTabId: 0,
        },
      },
    };

    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          files: [],
        },
      },
    };

    const instance = new Directory({
      actionService,
      fileService: undefined,
      panelId: 0,
      panelService,
      refstore: undefined,
      tabService,
    });

    instance.handleActivated(2);

    expect(activated.calls.length).toBe(1);
  });

  it("dispatches file actions without crashing", () => {
    const cursor = createSpy().andReturn(undefined);
    const selected = createSpy().andReturn(undefined);

    /** @type {*} */
    const fileService = {
      cursor,
      selected,
    };

    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          cursor: 0,
          selected: [],
        },
      },
    };

    /** @type {*} */
    const panelService = {
      activeId: 0,
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    const instance = new Directory({
      actionService: undefined,
      fileService: fileService,
      panelId: 0,
      panelService,
      refstore: undefined,
      tabService,
    });

    instance.handleCursor({ index: 1 });
    instance.handleSelected(1);

    expect(cursor.calls.length).toBe(1);
    expect(selected.calls.length).toBe(1);
  });

  it("dispatches tab actions without crashing", () => {
    const sorted = createSpy().andReturn(undefined);

    /** @type {*} */
    const panelService = {
      activeId: 0,
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    /** @type {*} */
    const tabService = {
      sorted: sorted,
    };

    const instance = new Directory({
      actionService: undefined,
      fileService: undefined,
      panelId: 0,
      panelService,
      refstore: undefined,
      tabService,
    });

    instance.handleClicked("ext");

    expect(sorted.calls.length).toBe(1);
  });
});
