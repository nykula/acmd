const expect = require("expect");
const noop = require("lodash/noop");
const { GioService } = require("../Gio/GioService");
const { PanelService } = require("../Panel/PanelService");
const { ActionService } = require("./ActionService");

describe("ActionService", () => {
  it("provides info about drives", () => {
    const gVolMon = {
      get_connected_drives: () => [],
    };

    const Gio = {
      File: {
        new_for_uri: () => ({
          query_filesystem_info: () => ({
            get_attribute_as_string: () => 1,
            list_attributes: () => ["filesystem::free"],
          }),
        }),
      },
      VolumeMonitor: {
        get: () => gVolMon,
      },
    };

    gVolMon.get_connected_drives = () => [{
      has_media: () => true,
      enumerate_identifiers: () => [
        "class",
        "unix-device",
        "uuid",
        "label",
      ],
      get_identifier: (x) => {
        switch (x) {
          case "class":
            return "device";

          case "unix-device":
            return "/dev/sda";

          case "uuid":
            return "abc";

          default:
            return "System";
        }
      },
      get_volumes: () => [{
        enumerate_identifiers: () => ["uuid"],
        get_identifier: () => null,
        get_mount: () => ({
          get_name: () => "System",
          get_icon: () => ({
            to_string: () => ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
          }),
          get_root: () => ({
            get_uri: () => "file:///media/System",
            query_filesystem_info: () => ({
              get_attribute_as_string: () => 1,
              list_attributes: () => ["filesystem::free"],
            }),
          }),
        }),
      }],
    }];

    gVolMon.get_mounts = () => [
      {
        get_name: () => "foo on bar.example.com",
        get_icon: () => ({
          to_string: () => ". GThemedIcon folder-remote folder",
        }),
        get_root: () => ({
          get_uri: () => "sftp:///foo@bar.example.com/",
          query_filesystem_info: () => ({
            get_attribute_as_string: () => 1,
            list_attributes: () => ["filesystem::free"],
          }),
        }),
      },
      {
        get_name: () => "System",
        get_icon: () => ({
          to_string: () => ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
        }),
        get_root: () => ({
          get_uri: () => "file:///media/System",
          query_filesystem_info: () => ({
            get_attribute_as_string: () => 1,
            list_attributes: () => ["filesystem::free"],
          }),
        }),
      },
    ];

    const set = expect.createSpy().andReturn(undefined);

    /** @type {*} */
    const mountService = { set: set };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, undefined);
    actionService.mountService = mountService;
    actionService.drives();

    expect(set).toHaveBeenCalledWith({
      drives: [{
        hasMedia: true,
        identifiers: {
          class: "device",
          "unix-device": "/dev/sda",
          uuid: "abc",
          label: "System",
        },
        volumes: [{
          mount: {
            name: "System",
            icon: ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
            iconType: "GICON",
            rootUri: "file:///media/System",
            attributes: { "filesystem::free": 1 },
          },
          identifiers: { uuid: null },
        }],
      }],
      mounts: [
        {
          name: "/",
          icon: "computer",
          iconType: "ICON_NAME",
          rootUri: "file:///",
          attributes: { "filesystem::free": 1 },
        },
        {
          name: "foo on bar.example.com",
          icon: ". GThemedIcon folder-remote folder",
          iconType: "GICON",
          rootUri: "sftp:///foo@bar.example.com/",
          attributes: { "filesystem::free": 1 },
        },
        {
          name: "System",
          icon: ". GThemedIcon drive-harddisk-usb drive-harddisk drive",
          iconType: "GICON",
          rootUri: "file:///media/System",
          attributes: { "filesystem::free": 1 },
        },
      ],
    });
  });

  it("lists files in a directory", () => {
    const dirGFile = {
      enumerate_children_async: function() {
        arguments[arguments.length - 1]();
      },

      enumerate_children_finish: () => ({
        next_files_async: function() {
          arguments[arguments.length - 1]();
        },

        next_files_finish: () => [{
          list_attributes: () => ["someNamespace::someKey"],
          get_attribute_as_string: () => "someValue",
          get_display_name: () => "file.txt",
          get_file_type: () => 2,
          get_icon: () => ({
            to_string: () => "some gio icon",
          }),
          get_name: () => "?@$/@!#$/*@!)(#</>E",
          get_modification_time: () => ({
            tv_sec: 0,
          }),
          get_size: () => 1,
        }],
      }),

      get_child: name => ({
        get_uri: () => "file:///" + name,
      }),

      get_parent: () => null,

      get_uri: () => "file:///",

      query_info_async: function() {
        arguments[arguments.length - 1]();
      },

      query_info_finish: () => ({
        list_attributes: () => ["someNamespace::someKey"],
        get_attribute_as_string: () => "someValue",
        get_display_name: () => "/",
        get_file_type: () => 1,
        get_icon: () => ({
          to_string: () => "some gio icon",
        }),
        get_name: () => "/",
        get_modification_time: () => ({
          tv_sec: 0,
        }),
        get_size: () => 1,
      }),
    };

    const Gio = {
      FileQueryInfoFlags: { NONE: 0 },
      FileType: {
        "typeA": 0,
        "typeB": 0,
        "typeC": 0,
      },
      file_new_for_uri: () => dirGFile,
    };

    const pushLocation = expect.createSpy().andReturn(undefined);
    const set = expect.createSpy().andReturn(undefined);

    /** @type {*} */
    const panelService = { pushLocation: pushLocation };

    /** @type {*} */
    const tabService = { set: set };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, undefined);
    actionService.panelService = panelService;
    actionService.tabService = tabService;

    const tabId = 0;
    actionService.ls(tabId, "file:///");

    expect(pushLocation.calls.length).toBe(1);
    expect(set).toHaveBeenCalledWith({
      files: [
        {
          displayName: ".",
          fileType: "typeB",
          icon: "some gio icon",
          iconType: "GICON",
          name: ".",
          modificationTime: 0,
          size: 1,
          attributes: {
            "someNamespace::someKey": "someValue",
          },
          "uri": "file:///",
          "mountUri": "file:///",
        },
        {
          displayName: "file.txt",
          fileType: "typeC",
          icon: "some gio icon",
          iconType: "GICON",
          name: "?@$/@!#$/*@!)(#</>E",
          modificationTime: 0,
          size: 1,
          attributes: {
            "someNamespace::someKey": "someValue",
          },
          "uri": "file:///?@$/@!#$/*@!)(#</>E",
        },
      ],
      id: 0,
      location: "file:///",
    });
  });

  it("creates a directory", () => {
    const Gio = {
      file_new_for_uri: () => ({
        make_directory_async: function() {
          arguments[arguments.length - 1]();
        },
        make_directory_finish: noop,
      }),
    };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, undefined);
    actionService.refresh = expect.createSpy().andReturn(undefined);

    actionService.mkdir("file:///someDir");
    expect(actionService.refresh).toHaveBeenCalled();
  });

  it("mounts a volume", () => {
    const gVolMon = {
      get_volumes: () => [{
        get_identifier: () => "random-uuid",
        mount: function() {
          arguments[arguments.length - 1]();
        },
      }],
    };

    const Gio = {
      MountMountFlags: { NONE: 0 },
      VolumeMonitor: { get: () => gVolMon },
    };

    const Gtk = {
      MountOperation: function() { },
    };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, Gtk);
    actionService.refresh = expect.createSpy().andReturn(undefined);

    actionService.mount("random-uuid");
    expect(actionService.refresh).toHaveBeenCalled();
  });

  it("unmounts a volume", () => {
    const Gio = {
      File: {
        new_for_uri: () => ({
          find_enclosing_mount: () => ({
            unmount: function() {
              arguments[arguments.length - 1]();
            },
          }),
        }),
      },
      MountUnmountFlags: { NONE: 0 },
    };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, undefined);
    actionService.refresh = expect.createSpy().andReturn(undefined);

    actionService.unmount("file:///media/Test");
    expect(actionService.refresh).toHaveBeenCalled();
  });

  it("toggles hidden file visibility", () => {
    /** @type {any} */
    const panelService = {
      showHidSys: undefined,
    };

    const actionService = new ActionService();
    actionService.panelService = panelService;

    actionService.showHidSys();
    expect(panelService.showHidSys).toEqual(true);

    actionService.showHidSys();
    expect(panelService.showHidSys).toEqual(false);
  });

  it("opens a terminal in the current directory", () => {
    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      entities: {
        "0": { location: "file:///" },
      },
    };

    const Gio = {
      SubprocessFlags: { NONE: 0 },
      SubprocessLauncher: function() {
        this.set_cwd = noop;
        this.set_flags = noop;
        this.spawnv = noop;
      },
    };

    const actionService = new ActionService();
    actionService.panelService = panelService;
    actionService.gioService = new GioService(Gio, undefined);
    actionService.tabService = tabService;

    actionService.terminal();
  });

  it("creates tab in panel, cloning active tab", () => {
    /** @type {*} */
    const tabService = {
      entities: {
        "0": {
          cursor: 1,
          files: [{ name: "foo" }, { name: "bar" }],
          location: "file:///",
          selected: [],
          sortedBy: "-date",
        },
        "1": {
          cursor: 0,
          files: [{ name: "foo" }, { name: "bar" }],
          location: "file:///",
          selected: [],
          sortedBy: "name",
        },
      },
    };

    const panelService = new PanelService(tabService);
    panelService.entities = {
      "0": {
        activeTabId: 0,
        tabIds: [0],
      },
      "1": {
        activeTabId: 1,
        tabIds: [1],
      },
    };

    const actionService = new ActionService();
    actionService.panelService = panelService;
    actionService.tabService = tabService;
    actionService.createTab(0);

    expect(panelService.entities).toMatch({
      "0": {
        activeTabId: 2,
        tabIds: [0, 2],
      },
      "1": {
        activeTabId: 1,
        tabIds: [1],
      },
    });

    expect(tabService.entities).toMatch({
      "0": {
        cursor: 1,
        files: [{ name: "foo" }, { name: "bar" }],
        location: "file:///",
        selected: [],
        sortedBy: "-date",
      },
      "1": {
        cursor: 0,
        files: [{ name: "foo" }, { name: "bar" }],
        location: "file:///",
        selected: [],
        sortedBy: "name",
      },
      "2": {
        cursor: 0,
        files: [{ name: "foo" }, { name: "bar" }],
        location: "file:///",
        selected: [],
        sortedBy: "-date",
      },
    });
  });
});
