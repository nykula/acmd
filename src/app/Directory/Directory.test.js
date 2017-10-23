const expect = require("expect");
const h = require("inferno-hyperscript").default;
const assign = require("lodash/assign");
const { observable } = require("mobx");
const { createSpy } = expect;
const { Directory, mapFileToRow } = require("./Directory");
const { shallow } = require("../Test/Test");

describe("Directory", () => {
  it("renders without crashing", () => {
    const panelService = {
      activeId: 0,

      entities: {
        "0": { activeTabId: 0 },
      },
    };

    const showHidSysService = {
      state: false,
    };

    const tabService = {
      entities: {
        "0": {
          cursor: 0,
          files: [{
            fileType: "REGULAR",
            icon: "some gio icon",
            iconType: "GICON",
            modificationTime: 1490397889,
            name: "foo.bar",
            size: 1000,
          }],
          selected: [],
          sortedBy: "-date",
        },
      },
    };

    shallow(
      h(Directory, {
        panelId: 0,
        panelService: panelService,
        showHidSysService: showHidSysService,
        tabService: tabService,
      }),
    );
  });

  it("maps files to table rows", () => {
    /** @type {*} */
    let file;
    let row;

    file = {
      fileType: "DIRECTORY",
      icon: "go-up",
      iconType: "ICON_NAME",
      modificationTime: 1490397889,
      name: "..",
    };
    row = {
      icon: { icon: "go-up", iconType: "ICON_NAME" },
      filename: "[..]",
      ext: "",
      size: "<DIR>",
    };
    expect(mapFileToRow(file)).toMatch(row);

    file = {
      fileType: "DIRECTORY",
      icon: "folder",
      iconType: "ICON_NAME",
      modificationTime: 1490397889,
      name: "Test",
    };
    row = {
      icon: { icon: "folder", iconType: "ICON_NAME" },
      filename: "[Test]",
      ext: "",
      size: "<DIR>",
    };
    expect(mapFileToRow(file)).toMatch(row);

    file = {
      fileType: "REGULAR",
      icon: "some gio icon",
      iconType: "GICON",
      modificationTime: 1490397889,
      name: "foo.bar",
      size: 1000,
    };
    row = {
      icon: { icon: "some gio icon", iconType: "GICON" },
      filename: "foo",
      ext: "bar",
      size: "1 k",
    };
    expect(mapFileToRow(file)).toMatch(row);
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
      panelService: panelService,
      refstore: undefined,
      showHidSysService: undefined,
      tabService: tabService,
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

  it("selects matching file as user types", () => {
    /** @type {*} */
    const panelService = {
      activeId: 0,
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    /** @type {*} */
    const showHidSysService = {
      state: false,
    };

    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          cursor: 1,
          files: [
            {
              fileType: "DIRECTORY",
              modificationTime: 0,
              name: "system32",
            },
            {
              fileType: "REGULAR",
              name: "Some File Name.jpeg",
              modificationTime: 0,
              size: 1048576,
            },
          ],
          sortedBy: "ext",
        },
      },
    };

    const { handleSearch } = new Directory({
      actionService: undefined,
      fileService: undefined,
      panelId: 0,
      panelService: panelService,
      refstore: undefined,
      showHidSysService: showHidSysService,
      tabService: tabService,
    });

    const store = {
      get_string_from_iter: x => x,
    };

    let skip;

    skip = handleSearch(store, null, "syst", 0);
    expect(skip).toBe(false);
    skip = handleSearch(store, null, "systt", 0);
    expect(skip).toBe(true);

    skip = handleSearch(store, null, "some fi", 1);
    expect(skip).toBe(false);
    skip = handleSearch(store, null, "some fir", 1);
    expect(skip).toBe(false); // Because cursor.
  });

  it("grabs child focus when isActive becomes true", () => {
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
      panelService: panelService,
      refstore: undefined,
      showHidSysService: undefined,
      tabService: undefined,
    });

    panelService.activeId = 0;

    const grabFocus = createSpy().andReturn(undefined);

    instance.refContainer({
      get_children: () => [{ grab_focus: grabFocus }],
    });

    expect(grabFocus).toHaveBeenCalled();
  });

  it("dispatches actions without crashing", () => {
    const activated = createSpy().andReturn(undefined);

    /** @type {*} */
    const actionService = {
      activated: activated,
    };

    const instance = new Directory({
      actionService: actionService,
      fileService: undefined,
      panelId: 0,
      panelService: undefined,
      refstore: undefined,
      showHidSysService: undefined,
      tabService: undefined,
    });

    instance.handleActivated(2);

    expect(activated.calls.length).toBe(1);
  });

  it("dispatches file actions without crashing", () => {
    const cursor = createSpy().andReturn(undefined);
    const selected = createSpy().andReturn(undefined);

    /** @type {*} */
    const fileService = {
      cursor: cursor,
      selected: selected,
    };

    /** @type {*} */
    const panelService = {
      entities: {
        "0": { activeTabId: 0 },
      },
    };

    const instance = new Directory({
      actionService: undefined,
      fileService: fileService,
      panelId: 0,
      panelService: panelService,
      refstore: undefined,
      showHidSysService: undefined,
      tabService: undefined,
    });

    instance.handleCursor(1);
    instance.handleSelected([1]);

    expect(cursor.calls.length).toBe(1);
    expect(selected.calls.length).toBe(1);
  });

  it("dispatches tab actions without crashing", () => {
    const sorted = createSpy().andReturn(undefined);

    /** @type {*} */
    const panelService = {
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
      panelService: panelService,
      refstore: undefined,
      showHidSysService: undefined,
      tabService: tabService,
    });

    instance.handleClicked("ext");

    expect(sorted.calls.length).toBe(1);
  });
});
