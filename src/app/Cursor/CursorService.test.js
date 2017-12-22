const { FileType } = imports.gi.Gio;
const expect = require("expect");
const { FileHandler } = require("../../domain/File/FileHandler");
const { TabService } = require("../Tab/TabService");
const { CursorService } = require("./CursorService");

describe("CursorService", () => {
  it("edits, rejecting if no env var", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const directoryService = {
      terminal: expect.createSpy(),
    };

    const cursorService = new CursorService({
      dialogService,
      directoryService,
    });

    cursorService.env = { EDITOR: undefined };
    cursorService.edit();

    expect(dialogService.alert).toHaveBeenCalled();
    expect(directoryService.terminal.calls.length).toBe(0);
  });

  it("edits, rejecting if file not local", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const directoryService = {
      terminal: expect.createSpy(),
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "sftp://foo@bar/baz" }),
    };

    const cursorService = new CursorService({
      dialogService,
      directoryService,
      panelService,
      tabService,
    });

    cursorService.env = { EDITOR: "vim" };
    cursorService.edit();

    expect(dialogService.alert).toHaveBeenCalled();
    expect(directoryService.terminal.calls.length).toBe(0);
  });

  it("edits", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const directoryService = {
      terminal: expect.createSpy(),
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "file:///foo.bar" }),
    };

    const cursorService = new CursorService({
      dialogService,
      directoryService,
      panelService,
      tabService,
    });

    cursorService.env = { EDITOR: "vim" };
    cursorService.edit();

    expect(directoryService.terminal).toHaveBeenCalledWith([
      "-e",
      "vim",
      "/foo.bar",
    ]);
  });

  it("opens dotdot", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {any} */
    const gioService = {};

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
      levelUp: expect.createSpy(),
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ name: ".." }),
    };

    const cursorService = new CursorService({
      dialogService,
      gioService,
      panelService,
      tabService,
    });

    cursorService.open();
    expect(panelService.levelUp).toHaveBeenCalled();
  });

  it("opens directory", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {any} */
    const gioService = {};

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
      ls: expect.createSpy(),
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({
        fileType: FileType.DIRECTORY,
        uri: "file:///",
      }),
    };

    const cursorService = new CursorService({
      dialogService,
      gioService,
      panelService,
      tabService,
    });

    cursorService.open();
    expect(panelService.ls).toHaveBeenCalledWith("file:///");
  });

  it("opens file, alerting if error", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const gioService = {
      getHandlers: function() {
        arguments[arguments.length - 1]({
          toString: () => "error message",
        });
      },
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "file:///foo.bin" }),
    };

    const cursorService = new CursorService({
      dialogService,
      gioService,
      panelService,
      tabService,
    });

    cursorService.open();
    expect(dialogService.alert).toHaveBeenCalledWith("error message");
  });

  it("opens file, alerting if no handlers", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const gioService = {
      getHandlers: function() {
        arguments[arguments.length - 1](undefined, {
          contentType: "text/plain",
          handlers: [],
        });
      },
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "file:///foo.bin" }),
    };

    const cursorService = new CursorService({
      dialogService,
      gioService,
      panelService,
      tabService,
    });

    cursorService.open();
    expect(dialogService.alert.calls[0].arguments[0]).toMatch(/text.plain/);
  });

  it("opens file", () => {
    /** @type {any} */
    const dialogService = {};

    /** @type {FileHandler} */
    const handler = {
      commandline: "/usr/bin/gedit %U",
      displayName: "Text Editor",
      icon: "gedit",
    };

    /** @type {any} */
    const gioService = {
      getHandlers: function() {
        arguments[arguments.length - 1](undefined, {
          handlers: [handler],
        });
      },

      launch: expect.createSpy(),
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "file:///foo.bar" }),
    };

    const cursorService = new CursorService({
      dialogService,
      gioService,
      panelService,
      tabService,
    });

    cursorService.open();
    expect(gioService.launch).toHaveBeenCalledWith(handler, ["file:///foo.bar"]);
  });

  it("views, rejecting if no env var", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const directoryService = {
      terminal: expect.createSpy(),
    };

    const cursorService = new CursorService({
      dialogService,
      directoryService,
    });

    cursorService.env = { PAGER: undefined };
    cursorService.view();

    expect(dialogService.alert).toHaveBeenCalled();
    expect(directoryService.terminal.calls.length).toBe(0);
  });

  it("views, rejecting if file not local", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const directoryService = {
      terminal: expect.createSpy(),
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "sftp://foo@bar/baz" }),
    };

    const cursorService = new CursorService({
      dialogService,
      directoryService,
      panelService,
      tabService,
    });

    cursorService.env = { PAGER: "less" };
    cursorService.view();

    expect(dialogService.alert).toHaveBeenCalled();
    expect(directoryService.terminal.calls.length).toBe(0);
  });

  it("views", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),
    };

    /** @type {any} */
    const directoryService = {
      terminal: expect.createSpy(),
    };

    /** @type {any} */
    const panelService = {
      getActiveTabId: () => 0,
    };

    /** @type {any} */
    const tabService = {
      getCursor: () => ({ uri: "file:///foo.bar" }),
    };

    const cursorService = new CursorService({
      dialogService,
      directoryService,
      panelService,
      tabService,
    });

    cursorService.env = { PAGER: "less" };
    cursorService.view();

    expect(directoryService.terminal).toHaveBeenCalledWith([
      "-e",
      "less",
      "/foo.bar",
    ]);
  });
});
