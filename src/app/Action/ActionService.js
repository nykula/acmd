const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const assign = require("lodash/assign");
const noop = require("lodash/noop");
const Fun = require("../Gjs/Fun").default;
const { DialogService } = require("../Dialog/DialogService");
const { GioService } = require("../Gio/GioService");
const { LogService } = require("../Log/LogService");
const getActiveMountUri = require("../Mount/getActiveMountUri").default;
const { MountService } = require("../Mount/MountService");
const { PanelService } = require("../Panel/PanelService");
const Refstore = require("../Refstore/Refstore").default;
const { TabService } = require("../Tab/TabService");

const Action = {
  CP: "CP",
  MV: "MV",
  RM: "RM",
};

// tslint:disable align
function ActionService(
  /** @type {DialogService} */ dialogService,
  /** @type {GioService} */    gioService,
  /** @type {any} */           Gtk,
  /** @type {LogService} */    logService,
  /** @type {MountService} */  mountService,
  /** @type {PanelService} */  panelService,
  /** @type {Refstore} */      refstore,
  /** @type {TabService} */    tabService,
  /** @type {any} */           win,
) {
  // tslint:enable align
  this.dialogService = dialogService;
  this.gioService = gioService;
  this.Gtk = Gtk;
  this.logService = logService;
  this.mountService = mountService;
  this.panelService = panelService;
  this.refstore = refstore;
  this.tabService = tabService;
  this.win = win;

  this.runWorker = (action) => this.gioAdapter.work.run(action, noop);
}

/**
 * @param {{ index: number, panelId: number }} props
 */
ActionService.prototype.activated = function(props) {
  const { index, panelId } = props;
  const tabId = this.panelService.entities[panelId].activeTabId;
  const { location } = this.tabService.entities[tabId];

  const files = this.panelService.visibleFiles[panelId];
  const file = files[index];

  const uri = location.replace(/\/?$/, "") + "/" + file.name;

  if (file.fileType !== "DIRECTORY") {
    this.ctxMenu();
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
 * @param {(string[])=} srcUris
 * @param {string=} destUri
 */
ActionService.prototype.cp = function(srcUris, destUri) {
  const files = this.getActiveFiles();
  const uris = files.map(x => x.uri);
  const urisStr = files.length === 1 ? uris[0] + " " : "\n" + uris.join("\n") + "\n";

  if (!srcUris) {
    const dest = this.getDest();
    const destUri = dest + "/" + (files.length === 1 ? files[0].name : "");

    this.dialogService.prompt("Copy " + urisStr + "to:", destUri, destUri => {
      if (!destUri) {
        return;
      }

      this.cp(srcUris, destUri);
    });

    return;
  }

  this.runWorker({
    type: Action.CP,
    requestId: Date.now(),
    srcUris: srcUris,
    destUri: destUri,
  })
    .on("end", () => {
      this.refresh();
    });
};

/**
 * @param {number} panelId
 */
ActionService.prototype.createTab = function(panelId) {
  const tabId = this.panelService.getNextTabId();
  const panel = this.panelService.entities[panelId];
  const prevTabId = panel.activeTabId;

  this.tabService.entities = (tabs => {
    tabs[tabId] = {
      cursor: 0,
      files: tabs[prevTabId].files,
      location: tabs[prevTabId].location,
      selected: [],
      sortedBy: tabs[prevTabId].sortedBy,
    };

    return tabs;
  })(assign({}, this.tabService.entities));

  panel.tabIds.push(tabId);
  panel.activeTabId = tabId;
};

ActionService.prototype.ctxMenu = function() {
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

    const menu = new this.Gtk.Menu();

    for (const handler of handlers) {
      const { displayName, icon } = handler;
      let item;

      if (icon) {
        item = new this.Gtk.MenuItem();

        const box = new this.Gtk.Box();
        item.add(box);

        const image = this.Gtk.Image.new_from_icon_name(icon, Gtk.IconSize.MENU);
        box.add(image);

        const label = new this.Gtk.Label({ label: displayName });
        box.add(label);
      } else {
        item = new this.Gtk.MenuItem({ label: displayName });
      }

      item.connect("activate", () => {
        this.gioService.launch(handler, [uri]);
      });

      menu.add(item);
    }

    menu.show_all();
    menu.popup(null, null, null, null, null);
  });
};

ActionService.prototype.drives = function() {
  this.gioService.drives((_, result) => {
    this.mountService.set(result);
  });
};

ActionService.prototype.editor = function() {
  const file = this.getCursor();
  this.dialogService.alert("Editing " + file.uri, noop);
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

/**
 * @param {number} panelId
 */
ActionService.prototype.levelUp = function(panelId) {
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
  if (typeof tabId === "undefined") {
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

      this.gioService.mount({ uri: input }, (error, uri) => {
        if (error) {
          this.dialogService.alert(error.message, noop);
        } else {
          this.ls(activeTabId, uri);
          this.drives();
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
};

/**
 * @param {string=} uri
 */
ActionService.prototype.mkdir = function(uri) {
  if (typeof uri === "undefined") {
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
 * @param {(string[])=} srcUris
 * @param {string=} destUri
 */
ActionService.prototype.mv = function(srcUris, destUri) {
  if (!srcUris) {
    const files = this.getActiveFiles();
    const uris = files.map(x => x.uri);
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

  this.runWorker({
    type: Action.MV,
    requestId: Date.now(),
    srcUris: srcUris,
    destUri: destUri,
  })
    .on("end", () => {
      this.refresh();
    });
};

ActionService.prototype.refresh = function() {
  const panel0TabId = this.panelService.entities[0].activeTabId;
  const panel1TabId = this.panelService.entities[1].activeTabId;
  this.ls(panel0TabId, this.tabService.entities[panel0TabId].location);
  this.ls(panel1TabId, this.tabService.entities[panel1TabId].location);
  this.drives();
};

/**
 * @param {(string[])=} uris
 */
ActionService.prototype.rm = function(uris) {
  if (!uris) {
    const files = this.getActiveFiles();
    const uris = files.map(x => x.uri);
    const urisStr = files.length === 1 ? uris[0] : "\n" + uris.join("\n") + "\n";

    this.dialogService.confirm("Are you sure you want to remove " + urisStr + "?", () => {
      this.rm(uris);
    });

    return;
  }

  this.runWorker({
    type: Action.RM,
    requestId: Date.now(),
    uris: uris,
  })
    .on("end", () => {
      this.refresh();
    });
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
  this.panelService.showHidSys = !this.panelService.showHidSys;
};

ActionService.prototype.terminal = function() {
  const location = this.tabService.entities[this.panelService.getActiveTabId()].location;

  if (location.indexOf("file:///") !== 0) {
    this.dialogService.alert("Operation not supported.", noop);
    return;
  }

  this.gioService.spawn({
    cwd: location.replace(/^file:\/\//, ""),
    argv: ["x-terminal-emulator"],
  });
};

/**
 * @param {string} uri
 */
ActionService.prototype.touch = function(uri) {
  if (typeof uri === "undefined") {
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
  const file = this.getCursor();
  this.dialogService.alert("Viewing " + file.uri, noop);
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

  const files = this.panelService.visibleFiles[this.panelService.activeId];
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

  const files = this.panelService.visibleFiles[this.panelService.activeId];
  return selected.map(index => files[index]);
};

exports.ActionService = ActionService;
