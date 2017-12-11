const { Event, Gravity, Rectangle } = imports.gi.Gdk;
const { FileType } = imports.gi.Gio;
const { Window } = imports.gi.Gtk;
const { DialogService } = require("../Dialog/DialogService");
const { DirectoryService } = require("../Directory/DirectoryService");
const { GioService } = require("../Gio/GioService");
const { autoBind } = require("../Gjs/autoBind");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");

/**
 * File under cursor in active tab.
 */
class CursorService {
  /**
   * @typedef IProps
   * @property {DialogService} dialogService
   * @property {DirectoryService} directoryService
   * @property {GioService} gioService
   * @property {PanelService} panelService
   * @property {TabService} tabService
   *
   * @param {IProps} props
   */
  constructor(props) {
    this.env = process.env;
    this.props = props;

    autoBind(this, CursorService.prototype, __filename);
  }

  /**
   * Opens file in terminal, with EDITOR environment variable.
   */
  edit() {
    const { dialogService, directoryService } = this.props;
    const editor = this.env.EDITOR;

    if (!editor) {
      dialogService.alert(`You have to define EDITOR environment variable.`);
      return;
    }

    const file = this.getCursor();
    const match = /^file:\/\/(.+)/.exec(file.uri);

    if (!match) {
      dialogService.alert(`${file.uri} is not local.`);
      return;
    }

    directoryService.terminal(["-e", editor, decodeURIComponent(match[1])]);
  }

  open() {
    const { dialogService, gioService, panelService } = this.props;
    const { fileType, name, uri } = this.getCursor();

    if (name === "..") {
      panelService.levelUp();
      return;
    }

    if (fileType === FileType.DIRECTORY) {
      panelService.ls(uri);
      return;
    }

    gioService.getHandlers(uri, (error, result) => {
      if (error) {
        dialogService.alert(error.message);
        return;
      }

      const { contentType, handlers } = result;

      if (!handlers.length) {
        dialogService.alert("No handlers registered for " + contentType + ".");
        return;
      }

      gioService.launch(handlers[0], [uri]);
    });
  }

  /**
   * Opens file in terminal, with PAGER environment variable.
   */
  view() {
    const { dialogService, directoryService } = this.props;
    const pager = this.env.PAGER;

    if (!pager) {
      dialogService.alert(`You have to define PAGER environment variable.`);
      return;
    }

    const file = this.getCursor();
    const match = /^file:\/\/(.+)/.exec(file.uri);

    if (!match) {
      dialogService.alert(`${file.uri} is not local.`);
      return;
    }

    directoryService.terminal(["-e", pager, decodeURIComponent(match[1])]);
  }

  /**
   * @private
   */
  getCursor() {
    const { panelService, tabService } = this.props;
    const activeTabId = panelService.getActiveTabId();

    return tabService.getCursor(activeTabId);
  }
}

exports.CursorService = CursorService;
