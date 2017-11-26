const { FileType } = imports.gi.Gio;
const expect = require("expect");
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

    expect(tabService.entities[0].cursor).toBe(2);
    expect(tabService.entities[0].selected.slice()).toEqual([0, 1]);
  });

  it("sorts files in tab", () => {
    const tabService = new TabService();

    const entities = {
      "0": {
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
        files: [
          "n.w.a",
          "run-d.m.c",
          "b.g knocc out & dresta",
        ].map(name => ({
          name: name,
          modificationTime: 0,
          fileType: FileType.DIRECTORY,
        })),
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
});
