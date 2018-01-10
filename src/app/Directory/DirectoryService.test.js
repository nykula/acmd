const { FileType } = imports.gi.Gio;
const expect = require("expect");
const noop = require("lodash/noop");
const { GioService } = require("../Gio/GioService");
const { DirectoryService } = require("./DirectoryService");

describe("DirectoryService", () => {
  it("makes child directory", () => {
    /** @type {any} */
    const dialogService = {
      prompt: function() {
        arguments[arguments.length - 1]("someDir");
      },
    };

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

    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({ location: "file:///" }),
      refresh: expect.createSpy(),
    };

    const directoryService = new DirectoryService({
      dialogService,
      gioService: new GioService(Gio),
      panelService,
    });

    directoryService.mkdir();
    expect(panelService.refresh).toHaveBeenCalled();
  });

  it("makes child directory, alerting on error", () => {
    /** @type {any} */
    const dialogService = {
      alert: expect.createSpy(),

      prompt: function() {
        arguments[arguments.length - 1]("someDir");
      },
    };

    /** @type {any} */
    const Gio = {
      File: {
        new_for_uri: () => ({
          make_directory_async: function() {
            arguments[arguments.length - 1]();
          },
          make_directory_finish: () => {
            throw new Error("Not supported.");
          },
        }),
      },
    };

    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({ location: "trash:///" }),
      refresh: noop,
    };

    const directoryService = new DirectoryService({
      dialogService,
      gioService: new GioService(Gio),
      panelService,
    });

    directoryService.mkdir();
    expect(dialogService.alert).toHaveBeenCalledWith("Not supported.");
  });

  it("opens terminal", () => {
    /** @type {any} */
    const Gio = {
      SubprocessLauncher: function() {
        this.set_cwd = noop;
        this.set_flags = noop;
        this.spawnv = noop;
      },
    };

    /** @type {any} */
    const panelService = {
      getActiveTab: () => ({ location: "file:///" }),
    };

    const directoryService = new DirectoryService({
      gioService: new GioService(Gio),
      panelService,
    });

    directoryService.terminal();
  });
});
