const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const assign = require("lodash/assign");
const isEqual = require("lodash/isEqual");
const noop = require("lodash/noop");
const range = require("lodash/range");
const { action, autorun, computed, extendObservable, observable } = require("mobx");
const { File } = require("../../domain/File/File");
const { ActionService } = require("../Action/ActionService");
const { FileService } = require("../File/FileService");
const autoBind = require("../Gjs/autoBind").default;
const { CHECKBOX, GICON, TEXT } = require("../ListStore/ListStore");
const { PanelService } = require("../Panel/PanelService");
const Refstore = require("../Refstore/Refstore").default;
const { TabService } = require("../Tab/TabService");
const DirectoryFiles = require("./DirectoryFiles").default;
const select = require("./select").default;

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {FileService} fileService
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {Refstore} refstore
 * @property {TabService} tabService
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
    title: null,
    name: "isSelected",
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

/** @type {{ cursor: number, selected: number[], sortedBy: string }} */
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
  this.props.actionService.activated({
    index,
    panelId: this.props.panelId,
  });
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

  this.props.fileService.cursor({
    cursor: index,
    panelId: this.props.panelId,
    tabId: this.tabId,
  });

  if (mouseEvent) {
    const button = mouseEvent.get_button()[1];

    if (button === Gdk.BUTTON_SECONDARY) {
      this.props.actionService.ctxMenu({ mouseEvent });
    }
  }
};

/**
 * @param {{ altKey: boolean, ctrlKey: boolean, limit: number, nativeEvent: any, rect: any, shiftKey: boolean, top: number, win: any, which: any }} ev
 */
Directory.prototype.handleKeyPressEvent = function(ev) {
  const { cursor, selected } = this.tab;

  const state = {
    limit: ev.limit,
    indices: range(0, this.getFiles().length),
    cursor: cursor,
    selected: selected,
    top: ev.top,
  };

  const nextState = select(state, ev);

  if (state !== nextState) {
    this.handleCursor({ index: nextState.cursor });

    if (!isEqual(state.selected.slice(), nextState.selected.slice())) {
      this.props.fileService.selected({
        panelId: this.props.panelId,
        selected: nextState.selected,
        tabId: this.tabId,
      });
    }

    return true;
  }

  const { actionService, panelService, panelId } = this.props;

  switch (ev.which) {
    case Gdk.KEY_BackSpace:
      actionService.levelUp(panelId);
      break;

    case Gdk.KEY_Menu:
      actionService.ctxMenu({
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
        actionService.mounts(0);
        return true;
      }
      break;

    case Gdk.KEY_2:
      if (ev.altKey) {
        actionService.mounts(1);
        return true;
      }
      break;

    case Gdk.KEY_F2:
      actionService.refresh();
      break;

    case Gdk.KEY_F3:
      actionService.view();
      break;

    case Gdk.KEY_F4:
      actionService.editor();
      break;

    case Gdk.KEY_F5:
      actionService.cp();
      break;

    case Gdk.KEY_F6:
      actionService.mv();
      break;

    case Gdk.KEY_F7:
      actionService.mkdir();
      break;

    case Gdk.KEY_F8:
      actionService.rm();
      break;

    case Gdk.KEY_b:
      if (ev.ctrlKey) {
        actionService.showHidSys();
      }
      break;

    case Gdk.KEY_c:
      if (ev.ctrlKey) {
        actionService.copy();
      }
      break;

    case Gdk.KEY_l:
      if (ev.ctrlKey) {
        actionService.ls();
      }
      break;

    case Gdk.KEY_t:
      if (ev.ctrlKey) {
        actionService.createTab();
      }
      break;

    case Gdk.KEY_v:
      if (ev.ctrlKey) {
        actionService.paste();
      }
      break;

    case Gdk.KEY_w:
      if (ev.ctrlKey) {
        actionService.removeTab();
      }
      break;

    case Gdk.KEY_x:
      if (ev.ctrlKey) {
        actionService.cut();
      }
      break;
  }

  return false;
};

Directory.prototype.handleLayout = function(node) {
  this.props.refstore.set("panel" + this.props.panelId)(node);
  this.focusIfActive();
};

/**
 * @param {value} number
 */
Directory.prototype.handleSelected = function(index) {
  let { selected } = this.tab;

  selected = selected.indexOf(index) === -1
    ? selected.concat(index)
    : selected.filter(x => x !== index);

  this.props.fileService.selected({
    panelId: this.props.panelId,
    selected: selected,
    tabId: this.tabId,
  });
};

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
  return Directory.prototype.cols
    .map(this.prefixSort)
    .map(col => assign({}, col, {
      on_clicked: () => this.handleClicked(col.name),
      on_toggled: col.name === "isSelected" ? this.handleSelected : undefined,
  }));
};

Directory.prototype.ref = function(node) {
  this.ref = noop;
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
      keyPressEventCallback: this.handleKeyPressEvent,
      layoutCallback: this.handleLayout,
      ref: this.ref,
    }, h(DirectoryFiles, { tabId: this.tabId }))
  );
};

exports.Directory = Directory;

exports.default = connect([
  "actionService",
  "fileService",
  "panelService",
  "refstore",
  "tabService",
])(Directory);
