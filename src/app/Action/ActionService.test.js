const { FileType } = imports.gi.Gio;
const expect = require("expect");
const noop = require("lodash/noop");
const { GioService } = require("../Gio/GioService");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");
const { ActionService } = require("./ActionService");

describe("ActionService", () => {
  it("gets places", () => {
    const set = expect.createSpy().andReturn(undefined);

    /** @type {*} */
    const gioService = {
      getPlaces: (callback) => callback(null, [1, 2, 3]),
    };

    /** @type {*} */
    const placeService = { set: set };

    const actionService = new ActionService();
    actionService.gioService = gioService;
    actionService.placeService = placeService;
    actionService.getPlaces();

    expect(set).toHaveBeenCalledWith([1, 2, 3]);
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
          get_attribute_as_string: () => "33204",
          get_display_name: () => "file.txt",
          get_file_type: () => FileType.REGULAR,
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
        get_attribute_as_string: () => "17405",
        get_display_name: () => "/",
        get_file_type: () => FileType.DIRECTORY,
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

    /** @type {any} */
    const Gio = {
      File: {
        new_for_uri: () => dirGFile,
      },
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
          fileType: FileType.DIRECTORY,
          icon: "some gio icon",
          iconType: "GICON",
          name: ".",
          mode: "1775",
          modificationTime: 0,
          mountUri: "file:///",
          size: 1,
          uri: "file:///",
        },
        {
          displayName: "file.txt",
          fileType: FileType.REGULAR,
          icon: "some gio icon",
          iconType: "GICON",
          mode: "0664",
          name: "?@$/@!#$/*@!)(#</>E",
          modificationTime: 0,
          mountUri: "",
          size: 1,
          uri: "file:///?@$/@!#$/*@!)(#</>E",
        },
      ],
      id: 0,
      location: "file:///",
    });
  });

  it("creates a directory", () => {
    /** @type {any} */
    const Gio = {
      File: {
        new_for_uri: () => ({
          make_directory_async: function() {
            arguments[arguments.length - 1]();
          },
          make_directory_finish: noop,
        }),
      },
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

    /** @type {any} */
    const Gio = {
      VolumeMonitor: { get: () => gVolMon },
    };

    /** @type {any} */
    const MountOperation = function() { };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, MountOperation);
    actionService.refresh = expect.createSpy().andReturn(undefined);

    actionService.mount("random-uuid");
    expect(actionService.refresh).toHaveBeenCalled();
  });

  it("unmounts a volume", () => {
    /** @type {any} */
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
    };

    const actionService = new ActionService();
    actionService.gioService = new GioService(Gio, undefined);
    actionService.refresh = expect.createSpy().andReturn(undefined);

    actionService.unmount("file:///media/Test");
    expect(actionService.refresh).toHaveBeenCalled();
  });

  it("toggles hidden file visibility", () => {
    /** @type {any} */
    const tabService = {
      showHidSys: undefined,
    };

    const actionService = new ActionService();
    actionService.tabService = tabService;

    actionService.showHidSys();
    expect(tabService.showHidSys).toEqual(true);

    actionService.showHidSys();
    expect(tabService.showHidSys).toEqual(false);
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

    /** @type {any} */
    const Gio = {
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

  it("creates tab, cloning active tab in active panel", () => {
    /** @type {any[]} */
    const files = [{ name: "foo" }, { name: "bar" }];

    const tabService = new TabService();
    tabService.entities[0] = {
      cursor: 1,
      files,
      location: "file:///",
      selected: [],
      sortedBy: "-date",
    };

    const panelService = new PanelService(tabService);
    panelService.activeId = 0;
    panelService.entities[0] = {
      activeTabId: 0,
      history: [],
      now: 0,
      tabIds: [0],
    };

    const actionService = new ActionService();
    actionService.panelService = panelService;
    actionService.tabService = tabService;
    actionService.createTab();

    expect(panelService.entities[0]).toMatch({
      activeTabId: 2,
      tabIds: [0, 2],
    });

    expect(JSON.parse(JSON.stringify(tabService.entities[2]))).toMatch({
      cursor: 1,
      files,
      location: "file:///",
      selected: [],
      sortedBy: "-date",
    });
  });

  it("removes tab in active panel", () => {
    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
      removeTab: expect.createSpy(),
    };

    const actionService = new ActionService();
    actionService.panelService = panelService;
    actionService.removeTab();

    expect(panelService.removeTab).toHaveBeenCalledWith(0);
  });

  it("reports issue", () => {
    const Gtk = {
      show_uri: expect.createSpy(),
    };

    const actionService = new ActionService();
    actionService.Gtk = Gtk;

    actionService.reportIssue();
    expect(Gtk.show_uri.calls[0].arguments[1]).toMatch(/github/);
  });

  it("opens editor, rejecting if no env var", () => {
    /** @type {*} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    const actionService = new ActionService();

    /** @type {*} */
    const getCursor = () => ({ uri: "file:///foo.bar" });
    const terminal = expect.createSpy();

    actionService.dialogService = dialogService;
    actionService.env = { EDITOR: undefined };
    actionService.getCursor = getCursor;
    actionService.terminal = terminal;

    actionService.editor();
    expect(dialogService.alert).toHaveBeenCalled();
    expect(terminal.calls.length).toBe(0);
  });

  it("opens editor, rejecting if file not local", () => {
    /** @type {*} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    const actionService = new ActionService();

    /** @type {*} */
    const getCursor = () => ({ uri: "sftp://foo@bar/baz" });
    const terminal = expect.createSpy();

    actionService.dialogService = dialogService;
    actionService.env = { EDITOR: "vim" };
    actionService.getCursor = getCursor;
    actionService.terminal = terminal;

    actionService.editor();
    expect(dialogService.alert).toHaveBeenCalled();
    expect(terminal.calls.length).toBe(0);
  });

  it("opens editor", () => {
    const actionService = new ActionService();

    /** @type {*} */
    const getCursor = () => ({ uri: "file:///foo.bar" });
    const terminal = expect.createSpy();

    actionService.env = { EDITOR: "vim" };
    actionService.getCursor = getCursor;
    actionService.terminal = terminal;

    actionService.editor();
    expect(terminal).toHaveBeenCalledWith(["-e", "vim", "/foo.bar"]);
  });

  it("views, rejecting if no env var", () => {
    /** @type {*} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    const actionService = new ActionService();

    /** @type {*} */
    const getCursor = () => ({ uri: "file:///foo.bar" });
    const terminal = expect.createSpy();

    actionService.dialogService = dialogService;
    actionService.env = { PAGER: undefined };
    actionService.getCursor = getCursor;
    actionService.terminal = terminal;

    actionService.view();
    expect(dialogService.alert).toHaveBeenCalled();
    expect(terminal.calls.length).toBe(0);
  });

  it("views, rejecting if file not local", () => {
    /** @type {*} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    const actionService = new ActionService();

    /** @type {*} */
    const getCursor = () => ({ uri: "sftp://foo@bar/baz" });
    const terminal = expect.createSpy();

    actionService.dialogService = dialogService;
    actionService.env = { EDITOR: "vim" };
    actionService.getCursor = getCursor;
    actionService.terminal = terminal;

    actionService.view();
    expect(dialogService.alert).toHaveBeenCalled();
    expect(terminal.calls.length).toBe(0);
  });

  it("views", () => {
    const actionService = new ActionService();

    /** @type {*} */
    const getCursor = () => ({ uri: "file:///foo.bar" });
    const terminal = expect.createSpy();

    actionService.env = { PAGER: "less" };
    actionService.getCursor = getCursor;
    actionService.terminal = terminal;

    actionService.view();
    expect(terminal).toHaveBeenCalledWith(["-e", "less", "/foo.bar"]);
  });
});
