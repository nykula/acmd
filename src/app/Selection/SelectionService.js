const { Event, Gravity, Rectangle } = imports.gi.Gdk;
const { action, extendObservable } = require("mobx");
const { FileHandler } = require("../../domain/File/FileHandler");
const { ClipboardService } = require("../Clipboard/ClipboardService");
const { DialogService } = require("../Dialog/DialogService");
const { GioService } = require("../Gio/GioService");
const { autoBind } = require("../Gjs/autoBind");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");
const { RefService } = require("../Ref/RefService");
const { TabService } = require("../Tab/TabService");

/**
 * Selected files in active tab, or the cursor file as fallback.
 */
class SelectionService {
  /**
   * @typedef IProps
   * @property {ClipboardService} clipboardService
   * @property {DialogService} dialogService
   * @property {GioService} gioService
   * @property {JobService} jobService
   * @property {PanelService} panelService
   * @property {RefService} refService
   * @property {TabService} tabService
   *
   * @param {IProps} props
   */
  constructor(props) {
    /**
     * @type {FileHandler[]}
     */
    this.handlers = [];

    this.props = props;

    autoBind(this, SelectionService.prototype, __filename);

    extendObservable(this, {
      handlers: this.handlers,
      setHandlers: action(this.setHandlers),
    });
  }

  /**
   * Stores URIs in clipboard, for another app to copy.
   */
  copy() {
    const { copy } = this.props.clipboardService;
    copy(this.getUris());
  }

  /**
   * Stores URIs in clipboard, for another app to move.
   */
  cut() {
    const { cut } = this.props.clipboardService;
    cut(this.getUris());
  }

  /**
   * Deselects all files.
   */
  deselectAll() {
    const { panelService, tabService } = this.props;
    tabService.deselectAll(panelService.getActiveTabId());
  }

  /**
   * Deselects files, prompting for name pattern.
   */
  deselectGlob() {
    const { dialogService, panelService, tabService } = this.props;

    dialogService.prompt("Pattern:", "", pattern => {
      if (!pattern) {
        return;
      }

      tabService.deselectGlob({
        id: panelService.getActiveTabId(),
        pattern,
      });
    });
  }

  /**
   * Joins URIs in a single string, for display in a dialog.
   */
  formatUris() {
    const uris = this.getUris();

    return uris.length > 1 ? "\n" + uris.join("\n") + "\n" : uris[0] + " ";
  }

  /**
   * Returns file objects.
   */
  getFiles() {
    const { panelService, tabService } = this.props;

    const activeTabId = panelService.getActiveTabId();
    const { cursor, selected } = tabService.entities[activeTabId];
    const files = tabService.visibleFiles[activeTabId];

    return selected.length ? selected.map(index => files[index]) : [files[cursor]];
  }

  /**
   * Returns URIs.
   */
  getUris() {
    return this.getFiles().map(x => x.uri);
  }

  /**
   * Deselects selected files, and selects non-selected files.
   */
  invert() {
    const { panelService, tabService } = this.props;
    tabService.invert(panelService.getActiveTabId());
  }

  /**
   * @param {{ keyEvent?: Event, mouseEvent?: Event, rect?: Rectangle, win?: Window }} props
   */
  menu(props) {
    const { dialogService, gioService, refService } = this.props;
    const { keyEvent, mouseEvent, rect, win } = props;
    const uri = this.getUris()[0];

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

      this.setHandlers(handlers);
      const menu = refService.get("ctxMenu");

      if (mouseEvent) {
        menu.popup_at_pointer(mouseEvent);
      } else {
        const rectAnchor = Gravity.SOUTH_EAST;
        const menuAnchor = Gravity.STATIC;
        menu.popup_at_rect(win, rect, rectAnchor, menuAnchor, keyEvent);
      }
    });
  }

  /**
   * Removes files, prompting for confirmation.
   */
  rm() {
    const { confirm } = this.props.dialogService;
    const { run } = this.props.jobService;
    const { refresh } = this.props.panelService;

    const uris = this.getUris();
    const urisStr = this.formatUris();

    confirm("Are you sure you want to remove " + urisStr + "?", response => {
      if (!response) {
        return;
      }

      run(
        {
          destUri: "",
          type: "rm",
          uris,
        },
        refresh,
      );
    });
  }

  /**
   * Selects all files.
   */
  selectAll() {
    const { panelService, tabService } = this.props;
    tabService.selectAll(panelService.getActiveTabId());
  }

  /**
   * In each panel, selects files not having an equivalent in the
   * opposite panel.
   */
  selectDiff() {
    const { panelService, tabService } = this.props;

    tabService.selectDiff(
      panelService.entities[0].activeTabId,
      panelService.entities[1].activeTabId,
    );
  }

  /**
   * Selects files, prompting for name pattern.
   */
  selectGlob() {
    const { dialogService, panelService, tabService } = this.props;

    dialogService.prompt("Pattern:", "", pattern => {
      if (pattern) {
        tabService.selectGlob({
          id: panelService.getActiveTabId(),
          pattern,
        });
      }

      return;
    });
  }

  /**
   * @param {FileHandler[]} handlers
   */
  setHandlers(handlers) {
    this.handlers = handlers;
  }

  /**
   * @private
   */
  getActiveTab() {
    const { panelService, tabService } = this.props;
    const tabId = panelService.getActiveTabId();

    return tabService.entities[tabId];
  }
}

exports.SelectionService = SelectionService;
