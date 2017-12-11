const expect = require("expect");
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
      gioService: undefined,
      panelService: undefined,
      tabService: undefined,
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
      gioService: undefined,
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
      gioService: undefined,
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
      gioService: undefined,
      panelService: undefined,
      tabService: undefined,
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
      gioService: undefined,
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
      gioService: undefined,
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
