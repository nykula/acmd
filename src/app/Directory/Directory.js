const Gdk = imports.gi.Gdk;
const { DragAction } = Gdk;
const { TreeView } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
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
const { CursorService } = require("../Cursor/CursorService");
const { DirectoryService } = require("../Directory/DirectoryService");
const { autoBind } = require("../Gjs/autoBind");
const { JobService } = require("../Job/JobService");
const { CHECKBOX, GICON, TEXT } = require("../ListStore/ListStore");
const { OppositeService } = require("../Opposite/OppositeService");
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");
const { RefService } = require("../Ref/RefService");
const { SelectionService } = require("../Selection/SelectionService");
const { TabService } = require("../Tab/TabService");
const { WindowService } = require("../Window/WindowService");
const DirectoryFiles = require("./DirectoryFiles").default;
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
 * @property {CursorService} cursorService
 * @property {DirectoryService} directoryService
 * @property {JobService} jobService
 * @property {number} panelId
 * @property {OppositeService} oppositeService
 * @property {PanelService} panelService
 * @property {PlaceService} placeService
 * @property {RefService} refService
 * @property {SelectionService} selectionService
 * @property {TabService} tabService
 * @property {WindowService} windowService
 *
 * @param {IProps} props
 */
function Directory(props) {
  Component.call(this, props);
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

Directory.prototype = Object.create(Component.prototype);

Directory.prototype.cols = [
  {
    name: "isSelected",
    title: null,
    type: CHECKBOX,
  },
  { title: null, name: "icon", type: GICON },
  { title: "Name", name: "filename", type: TEXT, expand: true },
  { title: "Ext", name: "ext", type: TEXT, min_width: 50 },
  { title: "Size", name: "size", type: TEXT, min_width: 55 },
  { title: "Date", name: "mtime", type: TEXT, min_width: 125 },
  { title: "Attr", name: "mode", type: TEXT, min_width: 45 },
];

/** @type {{ grab_focus(): void }}} */
Directory.prototype.node = undefined;

/** @type {IProps} */
Directory.prototype.props = undefined;

/** @type {{ cursor: number, location: string, selected: number[], sortedBy: string }} */
Directory.prototype.tab = undefined;

/** @type {number} */
Directory.prototype.tabId = undefined;

Directory.prototype.componentWillUnmount = function() {
  this.unsubscribeUpdate();
};

Directory.prototype.getTabId = function() {
  return this.props.panelService.entities[this.props.panelId].activeTabId;
};

Directory.prototype.getTab = function() {
  return this.props.tabService.entities[this.tabId];
};

Directory.prototype.getFiles = function() {
  return this.props.tabService.visibleFiles[this.tabId];
};

Directory.prototype.focusIfActive = function() {
  const isActive = this.props.panelService.activeId === this.props.panelId;

  if (isActive && this.node) {
    this.node.grab_focus();
  }
};

/**
 * @param {number} index
 */
Directory.prototype.handleActivated = function(index) {
  const { cursorService, panelService } = this.props;
  panelService.cursor(this.props.panelId, index);
  cursorService.open();
};

/**
 * @param {string} colName
 */
Directory.prototype.handleClicked = function(colName) {
  this.props.tabService.sorted({
    by: colName,
    tabId: this.tabId,
  });
};

/**
 * @param {{ index: number, mouseEvent?: any }} ev
 */
Directory.prototype.handleCursor = function(ev) {
  const { index, mouseEvent } = ev;
  const { panelService, selectionService } = this.props;

  panelService.cursor(this.props.panelId, index);

  if (mouseEvent) {
    const button = mouseEvent.get_button()[1];

    if (button === Gdk.BUTTON_SECONDARY) {
      selectionService.menu({ mouseEvent });
    }
  }
};

/**
 * @param {any} _node
 * @param {any} _dragContext
 * @param {{ set_uris(uris: string[]): void }} selectionData
 */
Directory.prototype.handleDrag = function(_node, _dragContext, selectionData) {
  const uris = this.props.selectionService.getUris();
  selectionData.set_uris(uris);
};

/**
 * @param {any} _node
 * @param {{ get_selected_action(): number }} dragContext
 * @param {number} _x
 * @param {number} _y
 * @param {{ get_uris(): string[] }} selectionData
 */
Directory.prototype.handleDrop = function(
  _node,
  dragContext,
  _x,
  _y,
  selectionData,
) {
  const { run } = this.props.jobService;
  const { refresh } = this.props.windowService;

  const selectedAction = dragContext.get_selected_action();
  const uris = selectionData.get_uris();
  const { location } = this.tab;

  run(
    {
      destUri: location,
      type: selectedAction === DragAction.MOVE ? "mv" : "cp",
      uris,
    },
    refresh,
  );
};

/**
 * @param {KeyPressEvent} ev
 */
Directory.prototype.handleKeyPressEvent = function(ev) {
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
      this.props.tabService.selected(this.tabId, nextState.selected);
    }

    return true;
  }

  const {
    cursorService,
    directoryService,
    jobService,
    oppositeService,
    panelId,
    panelService,
    placeService,
    selectionService,
    windowService,
  } = this.props;

  switch (ev.which) {
    case Gdk.KEY_BackSpace:
      panelService.levelUp(panelId);
      break;

    case Gdk.KEY_Menu:
      selectionService.menu({
        keyEvent: ev.nativeEvent,
        rect: ev.rect,
        win: ev.win,
      });
      break;

    case Gdk.KEY_ISO_Left_Tab:
    case Gdk.KEY_Tab:
      if (ev.ctrlKey && ev.shiftKey) {
        panelService.prevTab(panelId);
      } else if (ev.ctrlKey) {
        panelService.nextTab(panelId);
      } else {
        panelService.toggleActive();
      }
      return true;

    case Gdk.KEY_1:
      if (ev.altKey) {
        placeService.list(0);
        return true;
      }
      break;

    case Gdk.KEY_2:
      if (ev.altKey) {
        placeService.list(1);
        return true;
      }
      break;

    case Gdk.KEY_F2:
      windowService.refresh();
      break;

    case Gdk.KEY_F3:
      cursorService.view();
      break;

    case Gdk.KEY_F4:
      cursorService.edit();
      break;

    case Gdk.KEY_F5:
      oppositeService.cp();
      break;

    case Gdk.KEY_F6:
      oppositeService.mv();
      break;

    case Gdk.KEY_F7:
      directoryService.mkdir();
      break;

    case Gdk.KEY_F8:
      selectionService.rm();
      break;

    case Gdk.KEY_a:
      if (ev.ctrlKey) {
        selectionService.selectAll();
      }
      break;

    case Gdk.KEY_b:
      if (ev.ctrlKey) {
        windowService.showHidSys();
      }
      break;

    case Gdk.KEY_c:
      if (ev.ctrlKey) {
        selectionService.copy();
      }
      break;

    case Gdk.KEY_d:
      if (ev.ctrlKey) {
        selectionService.deselectAll();
      }
      break;

    case Gdk.KEY_I:
      if (ev.ctrlKey) {
        selectionService.invert();
      }
      break;

    case Gdk.KEY_j:
      if (ev.ctrlKey) {
        jobService.list();
      }
      break;

    case Gdk.KEY_l:
      if (ev.ctrlKey) {
        panelService.ls();
      }
      break;

    case Gdk.KEY_t:
      if (ev.ctrlKey) {
        panelService.createTab();
      }
      break;

    case Gdk.KEY_v:
      if (ev.ctrlKey) {
        directoryService.paste();
      }
      break;

    case Gdk.KEY_w:
      if (ev.ctrlKey) {
        panelService.removeTab();
      }
      break;

    case Gdk.KEY_x:
      if (ev.ctrlKey) {
        selectionService.cut();
      }
      break;
  }

  return false;
};

/**
 * @param {TreeView} node
 */
Directory.prototype.handleLayout = function(node) {
  this.props.refService.set("panel" + this.props.panelId)(node);
  this.focusIfActive();
};

/**
 * @param {number} index
 */
Directory.prototype.handleSelected = function(index) {
  let { selected } = this.tab;

  selected =
    selected.indexOf(index) === -1
      ? selected.concat(index)
      : selected.filter(x => x !== index);

  this.props.panelService.selected(this.props.panelId, selected);
};

/**
 * @param {{ name: string, title: string }} col
 */
Directory.prototype.prefixSort = function(col) {
  const { sortedBy } = this.tab;

  if (col.name === sortedBy) {
    return assign({}, col, { title: "↑" + col.title });
  }

  if ("-" + col.name === sortedBy) {
    return assign({}, col, { title: "↓" + col.title });
  }

  return col;
};

Directory.prototype.getCols = function() {
  return Directory.prototype.cols.map(this.prefixSort).map((
    /** @type {any} */ col,
  ) =>
    assign({}, col, {
      on_clicked: () => this.handleClicked(col.name),
      on_toggled: col.name === "isSelected" ? this.handleSelected : undefined,
    }),
  );
};

/**
 * @param {TreeView} node
 */
Directory.prototype.ref = function(node) {
  this.node = node;
};

Directory.prototype.render = function() {
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
};

exports.Directory = Directory;

exports.default = connect([
  "cursorService",
  "directoryService",
  "jobService",
  "oppositeService",
  "panelService",
  "placeService",
  "refService",
  "selectionService",
  "tabService",
  "windowService",
])(Directory);
