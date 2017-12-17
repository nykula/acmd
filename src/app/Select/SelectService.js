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
class SelectService {
  /**
   * @typedef IProps
   * @property {ClipboardService?} [clipboardService]
   * @property {DialogService?} [dialogService]
   * @property {GioService?} [gioService]
   * @property {JobService?} [jobService]
   * @property {PanelService?} [panelService]
   * @property {RefService?} [refService]
   * @property {TabService?} [tabService]
   *
   * @param {IProps} props
   */
  constructor(props) {
    /**
     * @type {FileHandler[]}
     */
    this.handlers = [];

    this.props = props;

    autoBind(this, SelectService.prototype, __filename);

    extendObservable(this, {
      handlers: this.handlers,
      setHandlers: action(this.setHandlers),
    });
  }

  /**
   * Stores URIs in clipboard, for another app to copy.
   */
  copy() {
    const { copy } =
      /** @type {ClipboardService} */ (this.props.clipboardService);

    copy(this.getUris());
  }

  /**
   * Stores URIs in clipboard, for another app to move.
   */
  cut() {
    const { cut } =
      /** @type {ClipboardService} */ (this.props.clipboardService);

    cut(this.getUris());
  }

  /**
   * Deselects all files.
   */
  deselectAll() {
    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { deselectAll } =
      /** @type {TabService} */ (this.props.tabService);

    deselectAll(getActiveTabId());
  }

  /**
   * Deselects files, prompting for name pattern.
   */
  deselectGlob() {
    const { prompt } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { deselectGlob } =
      /** @type {TabService} */ (this.props.tabService);

    prompt("Pattern:", "", pattern => {
      if (!pattern) {
        return;
      }

      deselectGlob({
        id: getActiveTabId(),
        pattern,
      });
    });
  }

  /**
   * Joins URIs in a single string, for display in a dialog.
   */
  formatUris() {
    const uris = this.getUris().map(decodeURI);

    return uris.length > 1 ? "\n" + uris.join("\n") + "\n" : uris[0] + " ";
  }

  /**
   * Returns file objects.
   */
  getFiles() {
    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { entities, visibleFiles } =
      /** @type {TabService} */ (this.props.tabService);

    const activeTabId = getActiveTabId();
    const { cursor, selected } = entities[activeTabId];
    const files = visibleFiles[activeTabId];

    return selected.length
      ? selected.map(index => files[index])
      : [files[cursor]];
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
    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { invert } =
      /** @type {TabService} */ (this.props.tabService);

    invert(getActiveTabId());
  }

  /**
   * @param {{ keyEvent?: Event, mouseEvent?: Event, rect?: Rectangle, win?: Window }} props
   */
  menu(props) {
    const { alert } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { getHandlers } =
      /** @type {GioService} */ (this.props.gioService);

    const { get } =
    /** @type {RefService} */ (this.props.refService);

    const { keyEvent, mouseEvent, rect, win } = props;
    const uri = this.getUris()[0];

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

      this.setHandlers(handlers);
      const menu = get("ctxMenu");

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
    const { confirm } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { run } =
      /** @type {JobService} */ (this.props.jobService);

    const { refresh } =
      /** @type {PanelService} */ (this.props.panelService);

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
    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { selectAll } =
    /** @type {TabService} */ (this.props.tabService);

    selectAll(getActiveTabId());
  }

  /**
   * In each panel, selects files not having an equivalent in the
   * opposite panel.
   */
  selectDiff() {
    const { entities } =
      /** @type {PanelService} */ (this.props.panelService);

    const { selectDiff } =
      /** @type {TabService} */ (this.props.tabService);

    selectDiff(entities[0].activeTabId, entities[1].activeTabId);
  }

  /**
   * Selects files, prompting for name pattern.
   */
  selectGlob() {
    const { prompt } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { selectGlob } =
      /** @type {TabService} */ (this.props.tabService);

    prompt("Pattern:", "", pattern => {
      if (pattern) {
        selectGlob({
          id: getActiveTabId(),
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
}

exports.SelectService = SelectService;
