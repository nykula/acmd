const { FileType } = imports.gi.Gio;
const expect = require("expect");
const { observable } = require("mobx");
const { createSpy } = expect;
const { h } = require("../Gjs/GtkInferno");
const { shallow } = require("../Test/Test");
const { Directory } = require("./Directory");

describe("Directory", () => {
  it("renders without crashing", () => {
    /** @type {any} */
    const panelService = {
      activeId: 0,

      getActiveTabId: () => 0,
    };

    /** @type {any} */
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
    /** @type {any} */
    const panelService = {
      activeId: 0,
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      entities: {
        "0": { sortedBy: "ext" },
      },
    };

    const instance = new Directory({
      panelId: 0,
      panelService,
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
      panelId: 0,
      panelService,
    });

    panelService.activeId = 0;

    /** @type {any} */
    const treeView = {
      grab_focus: createSpy().andReturn(undefined),
    };

    instance.ref(treeView);

    expect(treeView.grab_focus).toHaveBeenCalled();
  });

  it("dispatches actions without crashing", () => {
    /** @type {any} */
    const cursorService = {
      open: createSpy().andReturn(undefined),
    };

    /** @type {any} */
    const panelService = {
      activeId: 0,
      cursor: createSpy().andReturn(undefined),
    };

    const instance = new Directory({
      cursorService,
      panelId: 0,
      panelService,
    });

    instance.handleActivated(2);

    expect(panelService.cursor).toHaveBeenCalledWith(0, 2);
    expect(cursorService.open).toHaveBeenCalled();
  });

  it("dispatches file actions without crashing", () => {
    /** @type {any} */
    const panelService = {
      activeId: 0,
      cursor: createSpy().andReturn(undefined),
      getActiveTabId: () => 0,
      selected: createSpy().andReturn(undefined),
    };

    /** @type {any} */
    const tabService = {
      entities: {
        "0": {
          cursor: 0,
          selected: [],
        },
      },
    };

    const instance = new Directory({
      panelId: 0,
      panelService,
      tabService,
    });

    instance.handleCursor({ index: 1 });
    instance.handleSelected(1);

    expect(panelService.cursor.calls.length).toBe(1);
    expect(panelService.selected.calls.length).toBe(1);
  });

  it("dispatches tab actions without crashing", () => {
    const sorted = createSpy().andReturn(undefined);

    /** @type {any} */
    const panelService = {
      activeId: 0,
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      sorted: sorted,
    };

    const instance = new Directory({
      panelId: 0,
      panelService,
      tabService,
    });

    instance.handleClicked("ext");

    expect(sorted.calls.length).toBe(1);
  });
});
