const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const { ActionService } = require('./Action/ActionService')
const { DialogService } = require('./Dialog/DialogService')
const { FileService } = require('./File/FileService')
const { GioService } = require('./Gio/GioService')
const { LogService } = require('./Log/LogService')
const { MountService } = require('./Mount/MountService')
const Refstore = require('./Refstore/Refstore').default
const { ShowHidSysService } = require('./ShowHidSys/ShowHidSysService')
const { PanelService } = require('./Panel/PanelService')
const { TabService } = require('./Tab/TabService')

/**
 * @param {any} win
 */
function Services (win) {
  this.win = win

  this.dialogService = new DialogService(Gtk, this.win)
  this.gioService = new GioService(Gio, GLib, Gtk)
  this.logService = new LogService()
  this.mountService = new MountService()
  this.panelService = new PanelService()
  this.refstore = new Refstore()
  this.showHidSysService = new ShowHidSysService()
  this.tabService = new TabService()

  this.actionService = new ActionService(
    this.dialogService,
    this.gioService,
    Gtk,
    this.logService,
    this.mountService,
    this.panelService,
    this.refstore,
    this.showHidSysService,
    this.tabService,
    this.win
  )

  this.fileService = new FileService(
    this.logService,
    this.panelService,
    this.tabService
  )
}

exports.Services = Services
