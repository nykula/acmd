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
   * @property {DialogService?} [dialogService]
   * @property {DirectoryService?} [directoryService]
   * @property {GioService?} [gioService]
   * @property {PanelService?} [panelService]
   * @property {TabService?} [tabService]
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
    const { alert } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { terminal } =
      /** @type {DirectoryService} */ (this.props.directoryService);

    const editor = this.env.EDITOR;

    if (!editor) {
      alert(`You have to define EDITOR environment variable.`);
      return;
    }

    const file = this.getCursor();
    const match = /^file:\/\/(.+)/.exec(file.uri);

    if (!match) {
      alert(`${file.uri} is not local.`);
      return;
    }

    terminal(["-e", editor, decodeURIComponent(match[1])]);
  }

  open() {
    const { alert } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { getHandlers, launch } =
    /** @type {GioService} */ (this.props.gioService);

    const { levelUp, ls } =
      /** @type {PanelService} */ (this.props.panelService);

    const { fileType, name, uri } = this.getCursor();

    if (name === "..") {
      levelUp();
      return;
    }

    if (fileType === FileType.DIRECTORY) {
      ls(uri);
      return;
    }

    getHandlers(uri, (error, result) => {
      if (error) {
        alert(error.message);
        return;
      }

      const { contentType, handlers } = result;

      if (!handlers.length) {
        alert("No handlers registered for " + contentType + ".");
        return;
      }

      launch(handlers[0], [uri]);
    });
  }

  /**
   * Opens file in terminal, with PAGER environment variable.
   */
  view() {
    const { alert } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { terminal } =
      /** @type {DirectoryService} */ (this.props.directoryService);

    const pager = this.env.PAGER;

    if (!pager) {
      alert(`You have to define PAGER environment variable.`);
      return;
    }

    const file = this.getCursor();
    const match = /^file:\/\/(.+)/.exec(file.uri);

    if (!match) {
      alert(`${file.uri} is not local.`);
      return;
    }

    terminal(["-e", pager, decodeURIComponent(match[1])]);
  }

  /**
   * @private
   */
  getCursor() {
    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { getCursor } =
      /** @type {TabService} */ (this.props.tabService);

    return getCursor(getActiveTabId());
  }
}

exports.CursorService = CursorService;
