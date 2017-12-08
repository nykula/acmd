const { FileType } = imports.gi.Gio;
const expect = require("expect");
const { File } = require("../../domain/File/File");
const { TabService } = require("./TabService");

describe("TabService", () => {
  it("saves cursor", () => {
    const tabService = new TabService();

    tabService.entities[1].cursor = 0;
    tabService.entities[1].selected = [];

    tabService.cursor({
      cursor: 2,
      tabId: 1,
    });

    expect(tabService.entities[1].cursor).toEqual(2);
  });

  it("saves selected", () => {
    const tabService = new TabService();

    tabService.entities[1].cursor = 0;
    tabService.entities[1].selected = [];

    tabService.selected({
      selected: [3, 4, 5],
      tabId: 1,
    });

    expect(tabService.entities[1].selected.slice()).toEqual([3, 4, 5]);
  });

  it("sets files, adjusting selected and cursor if fewer", () => {
    const tabService = new TabService();

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
      sortedBy: "ext",
      selected: [0, 1, 2],
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
    const tabService = new TabService();

    const entities = {
      "0": {
        cursor: 0,
        files: [
          ["config.sub", 2],
          ["usb.ids", 1],
          ["magic.mgc", 0],
          ["pci.ids", 4],
          ["node_modules", 5, true],
          ["config.guess", 3],
        ].map(([name, modificationTime, isDir]) => ({
          name: name,
          modificationTime: modificationTime,
          fileType: isDir ? FileType.DIRECTORY : FileType.REGULAR,
        })),
        selected: [],
        sortedBy: undefined,
      },
    };
    tabService.entities = entities;

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
    const tabService = new TabService();

    const entities = {
      "0": {
        cursor: 0,
        files: [
          "n.w.a",
          "run-d.m.c",
          "b.g knocc out & dresta",
        ].map(name => ({
          name: name,
          modificationTime: 0,
          fileType: FileType.DIRECTORY,
        })),
        selected: [],
        sortedBy: undefined,
      },
    };
    tabService.entities = entities;

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
    const tabService = new TabService();
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
    const tabService = new TabService();
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
    const tabService = new TabService();
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
    const tabService = new TabService();
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
    const tabService = new TabService();
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
    const tabService = new TabService();
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
    const tabService = new TabService();
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
});
