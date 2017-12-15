const Gdk = imports.gi.Gdk;
const { DragAction } = Gdk;
const { TreeView } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const assign = require("lodash/assign");
const isEqual = require("lodash/isEqual");
const noop = require("lodash/noop");
const range = require("lodash/range");
const {
  action,
  autorun,
  computed,
  extendObservable,
  observable,
} = require("mobx");
const { File } = require("../../domain/File/File");
const { Tab } = require("../../domain/Tab/Tab");
const { ActionService } = require("../Action/ActionService");
const { CursorService } = require("../Cursor/CursorService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");
const { RefService } = require("../Ref/RefService");
const { SelectService } = require("../Select/SelectService");
const { TabService } = require("../Tab/TabService");
const { WindowService } = require("../Window/WindowService");
const DirectoryFiles = require("./DirectoryFiles").default;
const { DirectoryCols } = require("./DirectoryFiles");
const select = require("./select").default;

/**
 * @typedef KeyPressEvent
 * @property {boolean} altKey
 * @property {boolean} ctrlKey
 * @property {number} limit
 * @property {any} nativeEvent
 * @property {any} rect
 * @property {boolean} shiftKey
 * @property {number} top
 * @property {any} win
 * @property {any} which
 *
 * @typedef IProps
 * @property {CursorService?} [cursorService]
 * @property {JobService?} [jobService]
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 * @property {RefService?} [refService]
 * @property {SelectService?} [selectService]
 * @property {TabService?} [tabService]
 * @property {WindowService?} [windowService]
 *
 * @extends Component<IProps>
 */
class Directory extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);

    /** @type {any[]} */
    this.cols = [];

    /**
     * @type {{ [key: number]: { ctrl?: () => void, default?: () => void } }}
     */
    this.handlers = {};

    /** @type {TreeView}} */
    this.node = (/** @type {any} */ (undefined));

    /** @type {Tab} */
    this.tab = (/** @type {any} */ (undefined));

    this.tabId = 0;

    autoBind(this, Directory.prototype, __filename);

    extendObservable(this, {
      cols: computed(this.getCols),
      files: computed(this.getFiles),
      node: observable.ref(undefined),
      ref: action(this.ref),
      tab: computed(this.getTab),
      tabId: computed(this.getTabId),
    });

    this.unsubscribeUpdate = autorun(this.focusIfActive);
  }

  componentDidMount() {
    const { get } =
      /** @type {ActionService} */ (this.props.actionService);

    this.handlers = {
      [Gdk.KEY_BackSpace]: { none: get("panelService.levelUp").handler },
      [Gdk.KEY_F2]: { none: get("windowService.refresh").handler },
      [Gdk.KEY_F3]: { none: get("cursorService.view").handler },
      [Gdk.KEY_F4]: { none: get("cursorService.edit").handler },
      [Gdk.KEY_F5]: { none: get("oppositeService.cp").handler },
      [Gdk.KEY_F6]: { none: get("oppositeService.mv").handler },
      [Gdk.KEY_F7]: { none: get("directoryService.mkdir").handler },
      [Gdk.KEY_F8]: { none: get("selectService.rm").handler },
      [Gdk.KEY_a]: { ctrl: get("selectService.selectAll").handler },
      [Gdk.KEY_b]: { ctrl: get("windowService.showHidSys").handler },
      [Gdk.KEY_c]: { ctrl: get("selectService.copy").handler },
      [Gdk.KEY_d]: { ctrl: get("selectService.deselectAll").handler },
      [Gdk.KEY_I]: { ctrl: get("selectService.invert").handler },
      [Gdk.KEY_j]: { ctrl: get("jobService.list").handler },
      [Gdk.KEY_l]: { ctrl: get("panelService.ls").handler },
      [Gdk.KEY_t]: { ctrl: get("panelService.createTab").handler },
      [Gdk.KEY_v]: { ctrl: get("directoryService.paste").handler },
      [Gdk.KEY_w]: { ctrl: get("panelService.removeTab").handler },
      [Gdk.KEY_x]: { ctrl: get("selectService.cut").handler },
    };
  }

  componentWillUnmount() {
    this.unsubscribeUpdate();
  }

  getTabId() {
    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    return getActiveTabId(this.props.panelId);
  }

  getTab() {
    const { entities } =
      /** @type {TabService} */ (this.props.tabService);

    return entities[this.tabId];
  }

  getFiles() {
    const { visibleFiles } =
      /** @type {TabService} */ (this.props.tabService);

    return visibleFiles[this.tabId];
  }

  focusIfActive() {
    const { activeId } =
      /** @type {PanelService} */ (this.props.panelService);

    const isActive = activeId === this.props.panelId;

    if (isActive && this.node) {
      this.node.grab_focus();
    }
  }

  /**
   * @param {number} index
   */
  handleActivated(index) {
    const { open } =
      /** @type {CursorService} */ (this.props.cursorService);

    const { cursor } =
      /** @type {PanelService} */ (this.props.panelService);

    cursor(this.props.panelId, index);
    open();
  }

  /**
   * @param {string} colName
   */
  handleClicked(colName) {
    const { sorted } =
      /** @type {TabService} */ (this.props.tabService);

    sorted({
      by: colName,
      tabId: this.tabId,
    });
  }

  /**
   * @param {{ index: number, mouseEvent?: any }} ev
   */
  handleCursor(ev) {
    const { index, mouseEvent } = ev;

    const { cursor } =
      /** @type {PanelService} */ (this.props.panelService);

    cursor(this.props.panelId, index);

    if (mouseEvent) {
      const button = mouseEvent.get_button()[1];

      if (button === Gdk.BUTTON_SECONDARY) {
        const { menu } =
          /** @type {SelectService} */ (this.props.selectService);

        menu({ mouseEvent });
      }
    }
  }

  // tslint:disable:variable-name
  /**
   * @param {any} _node
   * @param {any} _dragContext
   * @param {{ set_uris(uris: string[]): void }} selectionData
   */
  handleDrag(_node, _dragContext, selectionData) {
    const { getUris } =
      /** @type {SelectService} */ (this.props.selectService);

    const uris = getUris();
    selectionData.set_uris(uris);
  }

  /**
   * @param {any} _node
   * @param {{ get_selected_action(): number }} dragContext
   * @param {number} _x
   * @param {number} _y
   * @param {{ get_uris(): string[] }} selectionData
   */
  handleDrop(_node, dragContext, _x, _y, selectionData) {
    const { run } =
      /** @type {JobService} */ (this.props.jobService);

    const { refresh } =
      /** @type {WindowService} */ (this.props.windowService);

    const selectedAction = dragContext.get_selected_action();
    const uris = selectionData.get_uris();
    const { location } = this.tab;

    run({
      destUri: location,
      type: selectedAction === DragAction.MOVE ? "mv" : "cp",
      uris,
    }, refresh);
  }
  // tslint-enable: variable-name

  /**
   * @param {KeyPressEvent} ev
   */
  handleKeyPressEvent(ev) {
    const tabService =
      /** @type {TabService} */ (this.props.tabService);

    const { cursor, selected } = this.tab;

    const state = {
      cursor: cursor,
      indices: range(0, this.getFiles().length),
      limit: ev.limit,
      selected: selected,
      top: ev.top,
    };

    const nextState = select(state, ev);

    if (state !== nextState) {
      this.handleCursor({ index: nextState.cursor });

      if (!isEqual(state.selected.slice(), nextState.selected.slice())) {
        tabService.selected(this.tabId, nextState.selected);
      }

      return true;
    }

    switch (ev.which) {
      case Gdk.KEY_Menu:
        const { menu } =
          /** @type {SelectService} */ (this.props.selectService);

        menu({
          keyEvent: ev.nativeEvent,
          rect: ev.rect,
          win: ev.win,
        });
        break;

      case Gdk.KEY_ISO_Left_Tab:
      case Gdk.KEY_Tab:
        const { nextTab, prevTab, toggleActive } =
          /** @type {PanelService} */ (this.props.panelService);

        if (ev.ctrlKey && ev.shiftKey) {
          prevTab();
        } else if (ev.ctrlKey) {
          nextTab();
        } else {
          toggleActive();
        }
        return true;

      case Gdk.KEY_1:
        if (ev.altKey) {
          const { list } =
            /** @type {PlaceService} */ (this.props.placeService);

          list(0);
          return true;
        }
        break;

      case Gdk.KEY_2:
        if (ev.altKey) {
          const { list } =
            /** @type {PlaceService} */ (this.props.placeService);

          list(1);
          return true;
        }
        break;

      default:
        const handler = this.handlers[ev.which];

        if (handler && !ev.ctrlKey && handler.default) {
          handler.default();
          return true;
        }

        if (handler && ev.ctrlKey && handler.ctrl) {
          handler.ctrl();
          return true;
        }
    }

    return false;
  }

  /**
   * @param {TreeView} node
   */
  handleLayout(node) {
    const { set } = /** @type {RefService} */ (this.props.refService);
    set("panel" + this.props.panelId)(node);
    this.focusIfActive();
  }

  /**
   * @param {number} index
   */
  handleSelected(index) {
    let { selected } = this.tab;
    selected =
      selected.indexOf(index) === -1
        ? selected.concat(index)
        : selected.filter(x => x !== index);

    const panelService =
      /** @type {PanelService} */ (this.props.panelService);

    panelService.selected(this.props.panelId, selected);
  }

  /**
   * @param {{ name: string, title: string | null }} col
   */
  prefixSort(col) {
    const { sortedBy } = this.tab;

    if (col.name === sortedBy) {
      return assign({}, col, { title: "↑" + col.title });
    }

    if ("-" + col.name === sortedBy) {
      return assign({}, col, { title: "↓" + col.title });
    }

    return col;
  }

  getCols() {
    const titles = {
      ext: "Ext",
      filename: "Name",
      mode: "Attr",
      mtime: "Date",
      size: "Size",
    };

    const widths = {
      ext: 50,
      mode: 45,
      mtime: 125,
      size: 55,
    };

    return DirectoryCols.map(col => {
      const title = titles[col.name];

      return this.prefixSort(assign({}, col, {
        expand: col.name === "filename",
        min_width: widths[col.name],
        on_clicked: title ? () => this.handleClicked(col.name) : undefined,
        on_toggled: col.name === "isSelected" ? this.handleSelected : undefined,
        title,
      }));
    });
  }

  /**
   * @param {TreeView} node
   */
  ref(node) {
    this.node = node;
  }

  render() {
    const { cursor } = this.tab;
    return (
      h("tree-view", {
        activatedCallback: this.handleActivated,
        cols: this.cols,
        cursor,
        cursorCallback: this.handleCursor,
        dragAction: DragAction.COPY + DragAction.MOVE,
        keyPressEventCallback: this.handleKeyPressEvent,
        layoutCallback: this.handleLayout,
        on_drag_data_get: this.handleDrag,
        on_drag_data_received: this.handleDrop,
        ref: this.ref,
      }, h(DirectoryFiles, { tabId: this.tabId }))
    );
  }
}

exports.Directory = Directory;

exports.default = connect([
  "actionService",
  "cursorService",
  "jobService",
  "panelService",
  "placeService",
  "refService",
  "selectService",
  "tabService",
  "windowService",
])(Directory);
