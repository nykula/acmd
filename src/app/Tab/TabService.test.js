const { FileType } = imports.gi.Gio;
const expect = require("expect");
const { toJS } = require("mobx");
const { File } = require("../../domain/File/File");
const { GioService } = require("../Gio/GioService");
const { EmptyProps } = require("../Test/Test");
const { TabService } = require("./TabService");

describe("TabService", () => {
  it("saves cursor", () => {
    const tabService = new TabService(EmptyProps);

    tabService.entities[1].cursor = 0;
    tabService.entities[1].selected = [];

    tabService.cursor({
      cursor: 2,
      tabId: 1,
    });

    expect(tabService.entities[1].cursor).toEqual(2);
  });

  it("saves selected", () => {
    const tabService = new TabService(EmptyProps);

    tabService.entities[1].cursor = 0;
    tabService.entities[1].selected = [];

    tabService.selected(1, [3, 4, 5]);

    expect(tabService.entities[1].selected.slice()).toEqual([3, 4, 5]);
  });

  it("sets files, adjusting selected and cursor if fewer", () => {
    const tabService = new TabService(EmptyProps);

    tabService.entities[0] = {
      cursor: 2,
      files: [0, 1, 2].map(i => ({
        displayName: `${i}`,
        fileType: FileType.REGULAR,
        icon: "computer",
        iconType: "ICON_NAME",
        mode: "0755",
        modificationTime: Date.now(),
        mountUri: `file:///`,
        name: `${i}`,
        size: 0,
        uri: `file:///${i}`,
      })),
      location: "file:///",
      selected: [0, 1, 2],
      sortedBy: "ext",
    };

    tabService.set({
      files: [0, 1].map(i => ({
        displayName: `${i}`,
        fileType: FileType.REGULAR,
        icon: "computer",
        iconType: "ICON_NAME",
        mode: "0755",
        modificationTime: Date.now(),
        mountUri: `file:///`,
        name: `${i}`,
        size: 0,
        uri: `file:///${i}`,
      })),
      id: 0,
      location: "file:///",
    });

    expect(tabService.entities[0].cursor).toBe(1);
    expect(tabService.entities[0].selected.slice()).toEqual([0, 1]);
  });

  it("sorts files in tab", () => {
    const tabService = new TabService(EmptyProps);

    tabService.entities[0].cursor = 0;
    tabService.entities[0].files = [
      ["config.sub", 2],
      ["usb.ids", 1],
      ["magic.mgc", 0],
      ["pci.ids", 4],
      ["node_modules", 5, true],
      ["config.guess", 3],
    ].map((props) => {
      const [name, modificationTime, isDir] = props;

      /** @type {any} */
      const file = new File();

      file.fileType = isDir ? FileType.DIRECTORY : FileType.REGULAR;
      file.modificationTime = modificationTime;
      file.name = name;

      return file;
    });
    tabService.entities[0].selected = [];
    tabService.entities[0].sortedBy = "";

    tabService.sorted({ tabId: 0, by: "filename" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "node_modules",
      "config.guess",
      "config.sub",
      "magic.mgc",
      "pci.ids",
      "usb.ids",
    ]);

    tabService.sorted({ tabId: 0, by: "filename" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "node_modules",
      "usb.ids",
      "pci.ids",
      "magic.mgc",
      "config.sub",
      "config.guess",
    ]);

    tabService.sorted({ tabId: 0, by: "ext" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "node_modules",
      "config.guess",
      "pci.ids",
      "usb.ids",
      "magic.mgc",
      "config.sub",
    ]);

    tabService.sorted({ tabId: 0, by: "ext" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "node_modules",
      "config.sub",
      "magic.mgc",
      "usb.ids",
      "pci.ids",
      "config.guess",
    ]);

    tabService.sorted({ tabId: 0, by: "mtime" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "node_modules",
      "magic.mgc",
      "usb.ids",
      "config.sub",
      "config.guess",
      "pci.ids",
    ]);

    tabService.sorted({ tabId: 0, by: "mtime" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "node_modules",
      "pci.ids",
      "config.guess",
      "config.sub",
      "usb.ids",
      "magic.mgc",
    ]);
  });

  it("ignores dots in dir names when sorting by ext", () => {
    const tabService = new TabService(EmptyProps);

    tabService.entities[0].cursor = 0;
    tabService.entities[0].files = [
      "n.w.a",
      "run-d.m.c",
      "b.g knocc out & dresta",
    ].map(name => {
      const file = new File();

      file.fileType = FileType.DIRECTORY;
      file.modificationTime = 0;
      file.name = name;

      return file;
    });
    tabService.entities[0].selected = [];
    tabService.entities[0].sortedBy = "";

    tabService.sorted({ tabId: 0, by: "ext" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "b.g knocc out & dresta",
      "n.w.a",
      "run-d.m.c",
    ]);

    tabService.sorted({ tabId: 0, by: "ext" });
    expect(tabService.entities[0].files.map(x => x.name)).toEqual([
      "run-d.m.c",
      "n.w.a",
      "b.g knocc out & dresta",
    ]);
  });

  it("selects glob", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tab.selected = [];

    tabService.selectGlob({
      id: 0,
      pattern: "*.ids",
    });

    expect(tab.selected.slice()).toEqual([1, 3]);
  });

  it("selects glob, noop if empty pattern", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tab.selected = [1, 3];

    tabService.selectGlob({
      id: 0,
      pattern: "",
    });

    expect(tab.selected.slice()).toEqual([1, 3]);
  });

  it("inverts", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tab.selected = [1, 3];

    tabService.invert(0);

    expect(tab.selected.slice()).toEqual([0, 2, 4, 5]);
  });

  it("deselects glob", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tab.selected = [0, 2, 4, 5];

    tabService.deselectGlob({
      id: 0,
      pattern: "*.guess",
    });

    expect(tab.selected.slice()).toEqual([0, 2, 4]);
  });

  it("deselects glob, noop if empty pattern", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tab.selected = [0, 2, 4];

    tabService.deselectGlob({
      id: 0,
      pattern: "",
    });

    expect(tab.selected.slice()).toEqual([0, 2, 4]);
  });

  it("deselects all", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tab.selected = [0, 2, 4];

    tabService.deselectAll(0);

    expect(tab.selected.length).toBe(0);
  });

  it("selects all", () => {
    const tabService = new TabService(EmptyProps);
    const tab = tabService.entities[0];

    tab.files = [
      "config.sub",
      "usb.ids",
      "magic.mgc",
      "pci.ids",
      "node_modules",
      "config.guess",
    ].map(name => {
      const file = new File();
      file.name = name;
      return file;
    });

    tabService.selectAll(0);

    expect(tab.selected.slice()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("selects diff, empty selected if all equal", () => {
    const tabService = new TabService(EmptyProps);

    const tab = tabService.entities[0];
    tab.files = [new File()];

    const tab1 = tabService.entities[1];
    tab1.files = [new File()];

    tabService.selectDiff(0, 1);

    expect(tab.selected.length).toBe(0);
    expect(tab1.selected.length).toBe(0);
  });

  it("selects diff, comparing name", () => {
    const tabService = new TabService(EmptyProps);

    const tab = tabService.entities[0];
    tab.files = [new File()];
    tab.files[0].name = "style.css";

    const tab1 = tabService.entities[1];
    tab1.files = [new File()];
    tab1.files[0].name = "main.js";

    tabService.selectDiff(0, 1);

    expect(tab.selected.slice()).toEqual([0]);
    expect(tab1.selected.slice()).toEqual([0]);
  });

  it("selects diff, comparing mtime", () => {
    const tabService = new TabService(EmptyProps);

    const tab = tabService.entities[0];
    tab.files = [new File()];
    tab.files[0].modificationTime = 0;

    const tab1 = tabService.entities[1];
    tab1.files = [new File()];
    tab1.files[0].modificationTime = 1;

    tabService.selectDiff(0, 1);

    expect(tab.selected.slice()).toEqual([0]);
    expect(tab1.selected.slice()).toEqual([0]);
  });

  it("selects diff, comparing size", () => {
    const tabService = new TabService(EmptyProps);

    const tab = tabService.entities[0];
    tab.files = [new File()];
    tab.files[0].size = 0;

    const tab1 = tabService.entities[1];
    tab1.files = [new File()];
    tab1.files[0].size = 1;

    tabService.selectDiff(0, 1);

    expect(tab.selected.slice()).toEqual([0]);
    expect(tab1.selected.slice()).toEqual([0]);
  });

  it("selects diff, skipping dotdot", () => {
    const tabService = new TabService(EmptyProps);

    const tab = tabService.entities[0];
    tab.files = [new File()];
    tab.files[0].name = "..";
    tab.files[0].size = 0;

    const tab1 = tabService.entities[1];
    tab1.files = [new File()];
    tab1.files[0].name = "..";
    tab1.files[0].size = 1;

    tabService.selectDiff(0, 1);

    expect(tab.selected.length).toBe(0);
    expect(tab1.selected.length).toBe(0);
  });

  it("lists files", () => {
    const dirGFile = {
      enumerate_children_async: function() {
        arguments[arguments.length - 1]();
      },

      enumerate_children_finish: () => ({
        next_files_async: function() {
          arguments[arguments.length - 1]();
        },

        next_files_finish: () => [{
          get_attribute_as_string: () => "33204",
          get_display_name: () => "file.txt",
          get_file_type: () => FileType.REGULAR,
          get_icon: () => ({
            to_string: () => "some gio icon",
          }),
          get_modification_time: () => ({
            tv_sec: 0,
          }),
          get_name: () => "?@$/@!#$/*@!)(#</>E",
          get_size: () => 1,
        }],
      }),

      /**
       * @param {string} name
       */
      get_child: name => ({
        get_uri: () => "file:///tmp/" + name,
      }),

      get_parent: () => false,

      get_uri: () => "file:///tmp",

      query_info_async: function() {
        arguments[arguments.length - 1]();
      },

      query_info_finish: () => ({
        get_attribute_as_string: () => "17405",
        get_display_name: () => "/",
        get_file_type: () => FileType.DIRECTORY,
        get_icon: () => ({
          to_string: () => "some gio icon",
        }),
        get_modification_time: () => ({
          tv_sec: 0,
        }),
        get_name: () => "/",
        get_size: () => 1,
      }),
    };

    /** @type {any} */
    const Gio = {
      File: {
        new_for_uri: () => dirGFile,
      },
    };

    const tabService = new TabService({
      gioService: new GioService(Gio),
    });

    tabService.ls(0, "file:///tmp");

    expect(tabService.entities[0].location).toBe("file:///tmp");

    expect(toJS(tabService.entities[0].files)).toEqual([
      {
        displayName: ".",
        fileType: FileType.DIRECTORY,
        icon: "some gio icon",
        iconType: "GICON",
        mode: "1775",
        modificationTime: 0,
        mountUri: "file:///",
        name: ".",
        size: 1,
        uri: "file:///tmp",
      },
      {
        displayName: "file.txt",
        fileType: FileType.REGULAR,
        icon: "some gio icon",
        iconType: "GICON",
        mode: "0664",
        modificationTime: 0,
        mountUri: "",
        name: "?@$/@!#$/*@!)(#</>E",
        size: 1,
        uri: "file:///tmp/?@$/@!#$/*@!)(#</>E",
      },
    ]);
  });
});
