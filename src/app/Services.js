const Gtk = imports.gi.Gtk;
const { Window } = Gtk;
const { ActionService } = require("./Action/ActionService");
const { ClipboardService } = require("./Clipboard/ClipboardService");
const { CursorService } = require("./Cursor/CursorService");
const { DialogService } = require("./Dialog/DialogService");
const { DirectoryService } = require("./Directory/DirectoryService");
const { GioService } = require("./Gio/GioService");
const { JobService } = require("./Job/JobService");
const { OppositeService } = require("./Opposite/OppositeService");
const { PanelService } = require("./Panel/PanelService");
const { PlaceService } = require("./Place/PlaceService");
const { RefService } = require("./Ref/RefService");
const { SelectService } = require("./Select/SelectService");
const { TabService } = require("./Tab/TabService");
const { WindowService } = require("./Window/WindowService");

class Services {
  /**
   * @param {Window} window
   */
  constructor(window) {
    const dialogService = new DialogService(window);

    const gioService = new GioService();

    const refService = new RefService();

    // ---

    const clipboardService = new ClipboardService({
      gioService,
    });

    const jobService = new JobService({
      refService,
    });

    const placeService = new PlaceService({
      refService,
    });

    const tabService = new TabService({
      gioService,
    });

    // ---

    const panelService = new PanelService({
      dialogService,
      placeService,
      tabService,
    });

    // ---

    const directoryService = new DirectoryService({
      clipboardService,
      dialogService,
      gioService,
      jobService,
      panelService,
    });

    const windowService = new WindowService({
      panelService,
      placeService,
      tabService,
      window,
    });

    // ---

    const cursorService = new CursorService({
      dialogService,
      directoryService,
      gioService,
      panelService,
      tabService,
    });

    const selectService = new SelectService({
      clipboardService,
      dialogService,
      gioService,
      jobService,
      panelService,
      refService,
      tabService,
    });

    // ---

    const oppositeService = new OppositeService({
      dialogService,
      jobService,
      panelService,
      selectService,
      tabService,
    });

    // ---

    this.clipboardService = clipboardService;
    this.cursorService = cursorService;
    this.dialogService = dialogService;
    this.directoryService = directoryService;
    this.gioService = gioService;
    this.jobService = jobService;
    this.oppositeService = oppositeService;
    this.panelService = panelService;
    this.placeService = placeService;
    this.refService = refService;
    this.selectService = selectService;
    this.tabService = tabService;
    this.windowService = windowService;

    // ---

    this.actionService = new ActionService(this);
  }
}

exports.Services = Services;
