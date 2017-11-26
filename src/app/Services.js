const Gtk = imports.gi.Gtk;
const { Window } = Gtk;
const { ActionService } = require("./Action/ActionService");
const { DialogService } = require("./Dialog/DialogService");
const { FileService } = require("./File/FileService");
const { GioService } = require("./Gio/GioService");
const { WorkerService } = require("./Gio/WorkerService");
const { LogService } = require("./Log/LogService");
const { PlaceService } = require("./Mount/PlaceService");
const Refstore = require("./Refstore/Refstore").default;
const { PanelService } = require("./Panel/PanelService");
const { TabService } = require("./Tab/TabService");

/**
 * @param {Window} win
 */
function Services(win) {
  this.win = win;

  this.dialogService = new DialogService(this.win);
  this.gioService = new GioService();
  this.logService = new LogService();
  this.placeService = new PlaceService();
  this.refstore = new Refstore();
  this.tabService = new TabService();
  this.workerService = new WorkerService();

  this.panelService = new PanelService(this.tabService);

  this.fileService = new FileService(this.panelService, this.tabService);

  this.actionService = new ActionService(
    this.dialogService,
    this.fileService,
    this.gioService,
    Gtk,
    this.logService,
    this.placeService,
    this.panelService,
    this.refstore,
    this.tabService,
    this.win,
    this.workerService,
  );
}

exports.Services = Services;
