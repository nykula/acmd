const { Event, Gravity, Rectangle } = imports.gi.Gdk;
const { FileType } = imports.gi.Gio;
const GLib = imports.gi.GLib;
const { Button, IconSize, Popover, Window } = imports.gi.Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { action, computed, extendObservable, observable, runInAction } = require("mobx");
const { WorkerProps } = require("../../domain/Gio/WorkerProps");
const { autoBind } = require("../Gjs/autoBind");
const Fun = require("../Gjs/Fun").default;
const { DialogService } = require("../Dialog/DialogService");
const { FileService } = require("../File/FileService");
const gioAsync = require("../Gio/gioAsync").default;
const { GioService } = require("../Gio/GioService");
const { WorkerService } = require("../Gio/WorkerService");
const { JobService } = require("../Job/JobService");
const { LogService } = require("../Log/LogService");
const getActiveMountUri = require("../Mount/getActiveMountUri").default;
const { PlaceService } = require("../Mount/PlaceService");
const { PanelService } = require("../Panel/PanelService");
const Refstore = require("../Refstore/Refstore").default;
const { TabService } = require("../Tab/TabService");

// tslint:disable align
function ActionService(
  /** @type {DialogService} */ dialogService,
  /** @type {FileService} */   fileService,
  /** @type {GioService} */    gioService,
  /** @type {any} */           Gtk,
  /** @type {JobService} */    jobService,
  /** @type {LogService} */    logService,
  /** @type {PlaceService} */  placeService,
  /** @type {PanelService} */  panelService,
  /** @type {Refstore} */      refstore,
  /** @type {TabService} */    tabService,
  /** @type {Window} */        win,
  /** @type {WorkerService} */ workerService,
) {
  // tslint:enable align
  this.dialogService = dialogService;
  this.fileService = fileService;
  this.gioService = gioService;
  this.Gtk = Gtk;
  this.jobService = jobService;
  this.logService = logService;
  this.placeService = placeService;
  this.panelService = panelService;
  this.refstore = refstore;
  this.tabService = tabService;
  this.win = win;
  this.workerService = workerService;

  autoBind(this, ActionService.prototype, __filename);

  extendObservable(this, {
    createTab: action(this.createTab),
    showHidSys: action(this.showHidSys),
  });
}

ActionService.prototype.env = process.env;

/**
 * @param {{ index: number, panelId: number }} props
 */
ActionService.prototype.activated = function(props) {
  const { index, panelId } = props;
  const tabId = this.panelService.entities[panelId].activeTabId;
  const { location } = this.tabService.entities[tabId];

  const files = this.tabService.visibleFiles[tabId];
  const file = files[index];

  const uri = location.replace(/\/?$/, "") + "/" + file.name;

  if (file.fileType !== FileType.DIRECTORY) {
    this.gioService.getHandlers(uri, (error, result) => {
      if (error) {
        this.dialogService.alert(error.message, noop);
        return;
      }

      const { contentType, handlers } = result;

      if (!handlers.length) {
        this.dialogService.alert("No handlers registered for " + contentType + ".", noop);
        return;
      }

      this.gioService.launch(handlers[0], [uri]);
    });

    return;
  }

  if (file.name === "..") {
    this.levelUp(panelId);
    return;
  }

  this.ls(tabId, uri);
};

ActionService.prototype.back = function() {
  const tabId = this.panelService.getActiveTabId();
  const uri = this.panelService.getHistoryItem(tabId, -1);

  if (uri) {
    this.ls(tabId, uri, -1);
  }
};

/**
 * @param {number} pid
 */
ActionService.prototype.cancel = function(pid) {
  this.jobService.stopWatching(pid);
  this.workerService.interrupt(pid);
};

ActionService.prototype.copy = function() {
  const uris = this.getActiveFiles().map(x => x.uri);

  this.gioService.spawn({
    argv: [__dirname.replace(/src.app.Action$/, "bin/clipboard.py"), "copy"].concat(uris),
  });
};

/**
 * @param {(string[])=} uris
 * @param {string=} destUri
 */
ActionService.prototype.cp = function(uris, destUri) {
  if (!uris) {
    const files = this.getActiveFiles();
    uris = files.map(x => x.uri);
    const urisStr = files.length === 1 ? uris[0] + " " : "\n" + uris.join("\n") + "\n";

    const dest = this.getDest();
    destUri = dest + "/" + (files.length === 1 ? files[0].name : "");

    this.dialogService.prompt("Copy " + urisStr + "to:", destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      this.cp(uris, finalDestUri);
    });

    return;
  }

  this.run({
    type: "cp",
    uris,
    destUri,
  });
};

ActionService.prototype.createTab = function() {
  const panelId = this.panelService.activeId;
  const tabId = this.panelService.getNextTabId();
  const panel = this.panelService.entities[panelId];
  const activeTab = this.tabService.entities[panel.activeTabId];

  const entities = {};
  entities[tabId] = {
    cursor: activeTab.cursor,
    files: observable.shallowArray(activeTab.files.slice()),
    location: activeTab.location,
    selected: [],
    sortedBy: activeTab.sortedBy,
  };
  extendObservable(this.tabService.entities, entities);

  const visibleFiles = {};
  visibleFiles[tabId] = computed(this.tabService.getVisibleFiles.bind(this.tabService, tabId));
  extendObservable(this.tabService.visibleFiles, visibleFiles);

  panel.tabIds.push(tabId);
  panel.activeTabId = tabId;
};

/**
 * @param {{ keyEvent?: Event, mouseEvent?: Event, rect?: Rectangle, win?: Window }} props
 */
ActionService.prototype.ctxMenu = function(props) {
  const { keyEvent, mouseEvent, rect, win } = props;
  const { uri } = this.getCursor();

  this.gioService.getHandlers(uri, (error, result) => {
    if (error) {
      this.dialogService.alert(error.message, noop);
      return;
    }

    const { contentType, handlers } = result;

    if (!handlers.length) {
      this.dialogService.alert("No handlers registered for " + contentType + ".", noop);
      return;
    }

    this.fileService.setHandlers(handlers);
    const menu = this.refstore.get("ctxMenu");

    if (mouseEvent) {
      menu.popup_at_pointer(mouseEvent);
    } else {
      const rectAnchor = Gravity.SOUTH_EAST;
      const menuAnchor = Gravity.STATIC;
      menu.popup_at_rect(win, rect, rectAnchor, menuAnchor, keyEvent);
    }
  });
};

ActionService.prototype.cut = function() {
  const uris = this.getActiveFiles().map(x => x.uri);

  this.gioService.spawn({
    argv: [__dirname.replace(/src.app.Action$/, "bin/clipboard.py"), "cut"].concat(uris),
  });
};

ActionService.prototype.getPlaces = function() {
  this.gioService.getPlaces((_, places) => {
    this.placeService.set(places);
  });
};

ActionService.prototype.editor = function() {
  const editor = this.env.EDITOR;

  if (!editor) {
    this.dialogService.alert(`You have to define EDITOR environment variable.`);
    return;
  }

  const file = this.getCursor();
  const match = /^file:\/\/(.+)/.exec(file.uri);

  if (!match) {
    this.dialogService.alert(`${file.uri} is not local.`);
    return;
  }

  this.terminal(["-e", editor, decodeURIComponent(match[1])]);
};

/**
 * @param {string} cmd
 */
ActionService.prototype.exec = function(cmd) {
  if (cmd.indexOf("javascript:") === 0) {
    Fun(cmd.slice("javascript:".length))();
    return;
  }

  const tabId = this.panelService.getActiveTabId();
  const { location } = this.tabService.entities[tabId];

  if (location.indexOf("file:///") !== 0) {
    this.dialogService.alert("Operation not supported.", noop);
    return;
  }

  this.gioService.spawn({
    cwd: location.replace(/^file:\/\//, ""),
    argv: GLib.shell_parse_argv(cmd)[1],
  });
};

ActionService.prototype.exit = function() {
  this.win.destroy();
};

ActionService.prototype.forward = function() {
  const tabId = this.panelService.getActiveTabId();
  const uri = this.panelService.getHistoryItem(tabId, 1);

  if (uri) {
    this.ls(tabId, uri, 1);
  }
};

ActionService.prototype.jobs = function() {
  /** @type {Popover} */
  const jobs = this.refstore.get("jobs");

  /** @type {Button} */
  const toolbarJobs = this.refstore.get("toolbarJobs");

  jobs.set_relative_to(toolbarJobs);
  jobs.show_all();
};

/**
 * @param {number} panelId
 */
ActionService.prototype.levelUp = function(panelId) {
  if (typeof panelId !== "number") {
    panelId = this.panelService.activeId;
  }

  const tabId = this.panelService.entities[panelId].activeTabId;
  const location = this.tabService.entities[tabId].location;
  let nextLocation = location.replace(/\/[^/]+$/, "");

  if (nextLocation === "file://") {
    nextLocation = "file:///";
  }

  this.ls(tabId, nextLocation);
};

/**
 * @param {number=} tabId
 * @param {string=} uri
 * @param {number=} delta
 */
ActionService.prototype.ls = function(tabId, uri, delta) {
  if (typeof tabId !== "number") {
    this.dialogService.prompt("List files at URI: ", "", input => {
      const activeTabId = this.panelService.getActiveTabId();

      if (input.indexOf("file:///") === 0) {
        this.ls(activeTabId, input);
        return;
      }

      if (input[0] === "/") {
        this.ls(activeTabId, "file://" + input);
        return;
      }

      this.gioService.mount({ uri: input }, (error, finalUri) => {
        if (error) {
          this.dialogService.alert(error.message, noop);
        } else {
          this.ls(activeTabId, finalUri);
          this.getPlaces();
        }
      });
    });

    return;
  }

  this.gioService.ls(uri, (error, files) => {
    if (error) {
      this.dialogService.alert(error.message, () => {
        if (this.tabService.entities[tabId].location !== "file:///") {
          this.ls(tabId, "file:///");
        }
      });

      return;
    }

    runInAction(() => {
      this.tabService.set({
        files: files,
        id: tabId,
        location: uri,
      });

      if (delta) {
        this.panelService.replaceLocation({
          delta: delta,
          tabId: tabId,
        });
      } else {
        this.panelService.pushLocation({
          tabId: tabId,
          uri: uri,
        });
      }
    });
  });
};

/**
 * @param {string=} uri
 */
ActionService.prototype.mkdir = function(uri) {
  if (typeof uri !== "string") {
    const tabId = this.panelService.getActiveTabId();
    const location = this.tabService.entities[tabId].location;

    this.dialogService.prompt("Name of the new dir:", "", name => {
      if (name) {
        this.mkdir(location + "/" + name.replace(/\//g, "_"));
      }
    });

    return;
  }

  this.gioService.mkdir(uri, error => {
    if (error) {
      this.dialogService.alert(error.message, noop);
      return;
    }

    this.refresh();
  });
};

/**
 * @param {string} uuid
 */
ActionService.prototype.mount = function(uuid) {
  const identifier = {
    type: "uuid",
    value: uuid,
  };

  this.gioService.mount({ identifier: identifier }, () => {
    this.refresh();
  });
};

/**
 * @param {number} panelId
 */
ActionService.prototype.mounts = function(panelId) {
  this.refstore.get("mounts" + panelId).popup();
};

/**
 * @param {(string[])=} uris
 * @param {string=} destUri
 */
ActionService.prototype.mv = function(uris, destUri) {
  if (!uris) {
    const files = this.getActiveFiles();
    uris = files.map(x => x.uri);
    const urisStr = files.length === 1 ? uris[0] + " " : "\n" + uris.join("\n") + "\n";

    const dest = this.getDest();
    const destUri = dest + "/" + (files.length === 1 ? files[0].name : "");

    this.dialogService.prompt("Move " + urisStr + "to:", destUri, destUri => {
      if (destUri) {
        this.mv(uris, destUri);
      }
    });

    return;
  }

  this.run({
    type: "mv",
    uris,
    destUri,
  });
};

ActionService.prototype.paste = function() {
  this.gioService.communicate([__dirname + "/../../../bin/clipboard.py", "paste"], (_, text) => {
    if (!text) {
      this.dialogService.alert("No text in clipboard.");
      return;
    }

    const uris = text.split("\n").filter(x => !!x.length);
    const action = uris.shift();

    if (action !== "copy" && action !== "cut") {
      this.dialogService.alert("No files have been copied or cut.");
      return;
    }

    const { location } = this.tabService.entities[this.panelService.getActiveTabId()];

    if (action === "copy") {
      this.cp(uris, location);
    } else {
      this.mv(uris, location);
    }
  });
};

ActionService.prototype.refresh = function() {
  const panel0TabId = this.panelService.entities[0].activeTabId;
  const panel1TabId = this.panelService.entities[1].activeTabId;
  this.ls(panel0TabId, this.tabService.entities[panel0TabId].location);
  this.ls(panel1TabId, this.tabService.entities[panel1TabId].location);
  this.getPlaces();
};

ActionService.prototype.removeTab = function() {
  const tabId = this.panelService.getActiveTabId();
  this.panelService.removeTab(tabId);
};

/**
 * @param {(string[])=} uris
 */
ActionService.prototype.rm = function(uris) {
  if (!uris) {
    const files = this.getActiveFiles();
    uris = files.map(x => x.uri);
    const urisStr = files.length === 1 ? uris[0] : "\n" + uris.join("\n") + "\n";

    this.dialogService.confirm("Are you sure you want to remove " + urisStr + "?", (response) => {
      if (response) {
        this.rm(uris);
      }
    });

    return;
  }

  this.run({
    type: "rm",
    uris,
    destUri: "",
  });
};

ActionService.prototype.reportIssue = function() {
  const time = Math.floor(Date.now() / 1000);
  this.Gtk.show_uri(null, "https://github.com/makepost/acme-commander/issues", time);
};

/**
 * @param {number} panelId
 */
ActionService.prototype.root = function(panelId) {
  const tabId = this.panelService.entities[panelId].activeTabId;
  const nextLocation = getActiveMountUri(this, panelId);
  this.ls(tabId, nextLocation);
};

ActionService.prototype.showHidSys = function() {
  this.tabService.showHidSys = !this.tabService.showHidSys;
};

/**
 * @param {(string[])=} argv
 */
ActionService.prototype.terminal = function(argv) {
  const location = this.tabService.entities[this.panelService.getActiveTabId()].location;

  if (location.indexOf("file:///") !== 0) {
    this.dialogService.alert("Operation not supported.", noop);
    return;
  }

  this.gioService.spawn({
    cwd: location.replace(/^file:\/\//, ""),
    argv: ["x-terminal-emulator"].concat(argv || []),
  });
};

/**
 * @param {string} uri
 */
ActionService.prototype.touch = function(uri) {
  if (typeof uri !== "string") {
    const location = this.tabService.entities[this.panelService.getActiveTabId()].location;

    this.dialogService.prompt("Name of the new file:", "", name => {
      if (name) {
        this.touch(location + "/" + name.replace(/\//g, "_"));
      }
    });

    return;
  }

  this.gioService.touch(uri, error => {
    if (error) {
      this.dialogService.alert(error.message, noop);
    } else {
      this.refresh();
    }
  });
};

/**
 * @param {string} uri
 */
ActionService.prototype.unmount = function(uri) {
  this.gioService.unmount(uri, () => {
    this.refresh();
  });
};

ActionService.prototype.view = function() {
  const pager = this.env.PAGER;

  if (!pager) {
    this.dialogService.alert(`You have to define PAGER environment variable.`);
    return;
  }

  const file = this.getCursor();
  const match = /^file:\/\/(.+)/.exec(file.uri);

  if (!match) {
    this.dialogService.alert(`${file.uri} is not local.`);
    return;
  }

  this.terminal(["-e", pager, decodeURIComponent(match[1])]);
};

/**
 * @private
 */
ActionService.prototype.getActiveFiles = function() {
  let files = this.getSelected();

  if (!files.length) {
    files = [this.getCursor()];
  }

  return files;
};

/**
 * @private
 */
ActionService.prototype.getCursor = function() {
  const activeTabId = this.panelService.getActiveTabId();
  const { cursor } = this.tabService.entities[activeTabId];

  const files = this.tabService.visibleFiles[activeTabId];
  const file = files[cursor];

  return file;
};

/**
 * @private
 */
ActionService.prototype.getDest = function() {
  const destPanelId = this.panelService.activeId === 0 ? 1 : 0;
  const destTabId = this.panelService.entities[destPanelId].activeTabId;
  const dest = this.tabService.entities[destTabId].location;
  return dest;
};

/**
 * @private
 */
ActionService.prototype.getSelected = function() {
  const activeTabId = this.panelService.getActiveTabId();
  const { selected } = this.tabService.entities[activeTabId];

  const files = this.tabService.visibleFiles[activeTabId];
  return selected.map(index => files[index]);
};

/**
 * @private
 * @param {WorkerProps} props
 */
ActionService.prototype.run = function(props) {
  const pid = this.workerService.run(props, (ev) => {
    if (ev.type === "progress") {
      this.jobService.save(pid, ev);
    } else if (ev.type === "error" || ev.type === "success") {
      this.jobService.remove(pid);
    }

    if (ev.type === "error") {
      this.dialogService.alert(ev.message, noop);
    } else if (ev.type === "success") {
      this.refresh();
    }
  });

  this.jobService.watch(pid, props.type);
};

exports.ActionService = ActionService;
