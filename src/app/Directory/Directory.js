const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const assign = require("lodash/assign");
const { autorun, extendObservable } = require("mobx");
const { File } = require("../../domain/File/File");
const { ActionService } = require("../Action/ActionService");
const getVisibleFiles = require("../Action/getVisibleFiles").default;
const { FileService } = require("../File/FileService");
const autoBind = require("../Gjs/autoBind").default;
const { GICON, TEXT } = require("../ListStore/ListStore");
const { PanelService } = require("../Panel/PanelService");
const Refstore = require("../Refstore/Refstore").default;
const { ShowHidSysService } = require("../ShowHidSys/ShowHidSysService");
const formatSize = require("../Size/formatSize").default;
const { TabService } = require("../Tab/TabService");

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {FileService} fileService
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {Refstore} refstore
 * @property {ShowHidSysService} showHidSysService
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function Directory(props) {
  Component.call(this, props);
  autoBind(this, Directory.prototype);

  extendObservable(this, {
    container: this.container,
  });

  this.unsubscribeUpdate = autorun(this.focusIfActive);
}

Directory.prototype = Object.create(Component.prototype);

/** @type {{ get_children(): { grab_focus(): void }[] }} */
Directory.prototype.container = undefined;

/** @type {IProps} */
Directory.prototype.props = undefined;

Directory.prototype.componentWillUnmount = function () {
  this.unsubscribeUpdate();
};

Directory.prototype.tabId = function () {
  return this.props.panelService.entities[this.props.panelId].activeTabId;
};

Directory.prototype.tab = function () {
  return this.props.tabService.entities[this.tabId()];
};

Directory.prototype.rows = function () {
  const panelId = this.props.panelId;
  const tabId = this.props.panelService.entities[panelId].activeTabId;
  const { files } = this.props.tabService.entities[tabId];

  const rows = getVisibleFiles({
    files: files,
    showHidSys: this.props.showHidSysService.state,
  }).map(mapFileToRow);

  return rows;
};

/**
 * @param {IProps=} props
 */
Directory.prototype.isActive = function (props = this.props) {
  return props.panelService.activeId === props.panelId;
};

Directory.prototype.focusIfActive = function () {
  if (this.container && this.isActive()) {
    const children = this.container.get_children();
    children[0].grab_focus();
  }
};

Directory.prototype.handleActivated = function (index) {
  this.props.actionService.activated({
    index: index,
    panelId: this.props.panelId,
  });
};

Directory.prototype.handleClicked = function (colName) {
  this.props.tabService.sorted({
    by: colName,
    tabId: this.tabId(),
  });
};

/**
 * @param {number} cursor
 */
Directory.prototype.handleCursor = function (cursor) {
  this.props.fileService.cursor({
    cursor: cursor,
    panelId: this.props.panelId,
    tabId: this.tabId(),
  });
};

Directory.prototype.handleKeyPressEvent = function (ev) {
  const { actionService, panelService, panelId } = this.props;
  const tabId = this.tabId();

  switch (ev.which) {
    case Gdk.KEY_BackSpace:
      actionService.levelUp(panelId);
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
        this.props.showHidSysService.toggle();
      }
      break;

    case Gdk.KEY_l:
      if (ev.ctrlKey) {
        actionService.ls();
      }
      break;

    case Gdk.KEY_t:
      if (ev.ctrlKey) {
        actionService.createTab(panelId);
      }
      break;

    case Gdk.KEY_w:
      if (ev.ctrlKey) {
        panelService.removeTab(tabId);
      }
      break;
  }

  return false;
};

Directory.prototype.handleLayout = function (node) {
  this.props.refstore.set("panel" + this.props.panelId)(node);
  this.focusIfActive();
};

Directory.prototype.handleSearch = function (store, _col, input, iter) {
  const { cursor } = this.tab();

  const skip = this.rows().map(({ filename, ext, size }) => {
    const isDir = size === "<DIR>";
    let name = filename;

    if (isDir) {
      name = name.slice(1, -1);
    }

    if (ext) {
      name += "." + ext;
    }

    return name.toLowerCase().indexOf(input.toLowerCase()) !== 0;
  });

  const index = Number(store.get_string_from_iter(iter));

  if (skip.indexOf(false) === -1 && index === cursor) {
    return false;
  }

  return skip[index];
};

/**
 * @param {number[]} selected
 */
Directory.prototype.handleSelected = function (selected) {
  this.props.fileService.selected({
    panelId: this.props.panelId,
    selected: selected,
    tabId: this.tabId(),
  });
};

Directory.prototype.prefixSort = function (col) {
  const { sortedBy } = this.tab();

  if (col.name === sortedBy) {
    return assign({}, col, { title: "↑" + col.title });
  }

  if ("-" + col.name === sortedBy) {
    return assign({}, col, { title: "↓" + col.title });
  }

  return col;
};

Directory.prototype.refContainer = function (node) {
  this.container = node;
};

Directory.prototype.render = function () {
  const rows = this.rows();
  const { cursor, selected } = this.tab();

  return (
    h("scrolled-window", {
      expand: true,
      hscrollbar_policy: Gtk.PolicyType.NEVER,
      ref: this.refContainer,
    }, [
        h('table', {
          cols: [
            { title: null, name: "icon", type: GICON },
            { title: "Name", name: "filename", type: TEXT, expand: true },
            { title: "Ext", name: "ext", type: TEXT, min_width: 50 },
            { title: "Size", name: "size", type: TEXT, min_width: 55 },
            { title: "Date", name: "mtime", type: TEXT, min_width: 125 },
            { title: "Attr", name: "mode", type: TEXT, min_width: 45 },
          ].map(this.prefixSort),
          // cursor: cursor,
          on_activated: this.handleActivated,
          // on_clicked: this.handleClicked,
          // on_cursor: this.handleCursor,
          // on_key_press_event: this.handleKeyPressEvent,
          // on_layout: this.handleLayout,
          // on_selected: this.handleSelected,
          // on_search: this.handleSearch,
          // selected: selected,
        },
          rows.map(props => h('tr', props))
        ),
      ])
  );
};

exports.mapFileToRow = mapFileToRow;
/**
 * @param {File} file
 */
function mapFileToRow(file) {
  let { icon, iconType } = file;
  let filename = file.name;
  let ext = "";
  let mode = "";

  const matches = /^(.+)\.(.*?)$/.exec(file.name);

  if (file.fileType !== "DIRECTORY" && file.name !== ".." && matches) {
    filename = matches[1];
    ext = matches[2];
  }

  if (file.fileType === "DIRECTORY") {
    filename = "[" + file.name + "]";
  }

  const mtime = ((time) => {
    const date = new Date(time * 1000);

    const month = ("00" + (date.getMonth() + 1)).slice(-2);
    const day = ("00" + (date.getDate())).slice(-2);
    const year = ("0000" + (date.getFullYear())).slice(-4);
    const hours = ("00" + (date.getHours())).slice(-2);
    const minutes = ("00" + (date.getMinutes())).slice(-2);

    return [month, day, year].join("/") + " " + [hours, minutes].join(":");
  })(file.modificationTime);

  if (file.attributes && file.attributes["unix::mode"]) {
    mode = Number(file.attributes["unix::mode"]).toString(8).slice(-4);
  }

  return {
    icon: { icon: icon, iconType: iconType },
    filename: filename,
    ext: ext,
    size: file.fileType === "DIRECTORY" ? "<DIR>" : formatSize(file.size),
    mtime: mtime,
    mode: mode,
  };
}

exports.Directory = Directory;

exports.default = connect([
  "actionService",
  "fileService",
  "panelService",
  "refstore",
  "showHidSysService",
  "tabService",
])(Directory);
