const { Event, Gravity, Rectangle } = imports.gi.Gdk;
const { action, decorate, observable } = require("mobx");
const nullthrows = require("nullthrows").default;
const { FileHandler } = require("../../domain/File/FileHandler");
const { ClipboardService } = require("../Clipboard/ClipboardService");
const { CursorService } = require("../Cursor/CursorService");
const { DialogService } = require("../Dialog/DialogService");
const { autoBind } = require("../Gjs/autoBind");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");
const { RefService } = require("../Ref/RefService");
const { TabService } = require("../Tab/TabService");
const { UriService } = require("../Uri/UriService");

/**
 * Selected files in active tab, or the cursor file as fallback.
 */
class SelectService {
  /**
   * @typedef IProps
   * @property {ClipboardService?} [clipboardService]
   * @property {CursorService?} [cursorService]
   * @property {DialogService?} [dialogService]
   * @property {JobService?} [jobService]
   * @property {PanelService?} [panelService]
   * @property {RefService?} [refService]
   * @property {TabService?} [tabService]
   * @property {UriService?} [uriService]
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
  }

  /**
   * Stores URIs in clipboard, for another app to copy.
   */
  copy() {
    const { copy } = nullthrows(this.props.clipboardService);

    copy(this.getUris());
  }

  /**
   * Stores URIs in clipboard, for another app to move.
   */
  cut() {
    const { cut } = nullthrows(this.props.clipboardService);

    cut(this.getUris());
  }

  /**
   * Deselects all files.
   */
  deselectAll() {
    const { getActiveTabId } = nullthrows(this.props.panelService);
    const { deselectAll } = nullthrows(this.props.tabService);

    deselectAll(getActiveTabId());
  }

  /**
   * Deselects files, prompting for name pattern.
   */
  deselectGlob() {
    const { prompt } = nullthrows(this.props.dialogService);
    const { getActiveTabId } = nullthrows(this.props.panelService);
    const { deselectGlob } = nullthrows(this.props.tabService);

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
    const { unescape } = nullthrows(this.props.uriService);
    const uris = this.getUris().map(unescape);

    return uris.length > 1 ? "\n" + uris.join("\n") + "\n" : uris[0] + " ";
  }

  /**
   * Returns file objects.
   */
  getFiles() {
    const { getActiveTabId } = nullthrows(this.props.panelService);
    const { entities, visibleFiles } = nullthrows(this.props.tabService);

    const activeTabId = getActiveTabId();
    const { cursor, selected } = entities[activeTabId];
    let files = visibleFiles[activeTabId];

    if (selected.length) {
      files = selected.map(index => files[index]);
    } else if (files.length > cursor) {
      files = [files[cursor]];
    }

    files = files.filter(x => x.name !== "..");

    return files;
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
    const { getActiveTabId } = nullthrows(this.props.panelService);
    const { invert } = nullthrows(this.props.tabService);

    invert(getActiveTabId());
  }

  /**
   * @param {{ keyEvent?: Event, mouseEvent?: Event, rect?: Rectangle, win?: Window }} props
   */
  menu(props) {
    const { getHandlers } = nullthrows(this.props.cursorService);
    const { alert } = nullthrows(this.props.dialogService);
    const { get } = nullthrows(this.props.refService);

    const { keyEvent, mouseEvent, rect, win } = props;
    const uri = this.getUris()[0];

    getHandlers(uri, (error, result) => {
      if (!result) {
        alert(String(error));
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
    const { confirm } = nullthrows(this.props.dialogService);
    const { run } = nullthrows(this.props.jobService);
    const { refresh } = nullthrows(this.props.panelService);

    const uris = this.getUris();

    if (!uris.length) {
      alert("Select a file.");
      return;
    }

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
    const { getActiveTabId } = nullthrows(this.props.panelService);
    const { selectAll } = nullthrows(this.props.tabService);

    selectAll(getActiveTabId());
  }

  /**
   * In each panel, selects files not having an equivalent in the
   * opposite panel.
   */
  selectDiff() {
    const { entities } = nullthrows(this.props.panelService);
    const { selectDiff } = nullthrows(this.props.tabService);

    selectDiff(entities[0].activeTabId, entities[1].activeTabId);
  }

  /**
   * Selects files, prompting for name pattern.
   */
  selectGlob() {
    const { prompt } = nullthrows(this.props.dialogService);
    const { getActiveTabId } = nullthrows(this.props.panelService);
    const { selectGlob } = nullthrows(this.props.tabService);

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

decorate(SelectService, {
  handlers: observable,
  setHandlers: action,
});

exports.SelectService = SelectService;
