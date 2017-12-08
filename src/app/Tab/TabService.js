const { FileType } = imports.gi.Gio;
const GLib = imports.gi.GLib;
const { action, computed, extendObservable, observable } = require("mobx");
const orderBy = require("lodash/orderBy");
const { autoBind } = require("../Gjs/autoBind");
const { File } = require("../../domain/File/File");
const { Tab } = require("../../domain/Tab/Tab");

function TabService() {
  autoBind(this, TabService.prototype, __filename);

  extendObservable(this, {
    cursor: action(this.cursor),
    deselectAll: action(this.deselectAll),
    entities: {
      0: {
        cursor: 0,
        files: observable.shallowArray(sampleFiles),
        location: "file:///",
        selected: [],
        sortedBy: "ext",
      },
      1: {
        cursor: 0,
        files: observable.shallowArray(sampleFiles),
        location: "file:///",
        selected: [],
        sortedBy: "ext",
      },
    },
    invert: action(this.invert),
    selectAll: action(this.selectAll),
    selected: action(this.selected),
    set: action(this.set),
    showHidSys: this.showHidSys,
    sorted: action(this.sorted),
    visibleFiles: {
      "0": computed(this.getVisibleFiles.bind(this, 0)),
      "1": computed(this.getVisibleFiles.bind(this, 1)),
    },
  });
}

/**
 * @type {File[]}
 */
const sampleFiles = [{
  displayName: "..",
  fileType: FileType.DIRECTORY,
  icon: "go-up",
  iconType: "ICON_NAME",
  mode: "1755",
  modificationTime: 0,
  mountUri: "file:///",
  name: "..",
  size: 0,
  uri: "file:///",
}];

/**
 * @type {{ [ id: number ]: Tab }}
 */
TabService.prototype.entities = undefined;

TabService.prototype.showHidSys = false;

/**
 * @type {{ [id: string]: File[] }}
 */
TabService.prototype.visibleFiles = undefined;

/**
 * @param {{ cursor: number, tabId: number }} props
 */
TabService.prototype.cursor = function(props) {
  this.entities[props.tabId].cursor = props.cursor;
};

/**
 * @param {number} tabId
 */
TabService.prototype.deselectAll = function(tabId) {
  this.entities[tabId].selected.splice(0);
};

/**
 * @param {{ id: number, pattern: string }} props
 */
TabService.prototype.deselectGlob = function(props) {
  if (!props.pattern) {
    return;
  }

  const tab = this.entities[props.id];
  const visibleFiles = this.visibleFiles[props.id];

  tab.selected = tab.selected
    .filter(i => !GLib.pattern_match_simple(props.pattern, visibleFiles[i].name));
};

/**
 * @param {number} tabId
 */
TabService.prototype.invert = function(tabId) {
  const tab = this.entities[tabId];

  tab.selected = this.visibleFiles[tabId]
    .map((_, i) => i)
    .filter((i) => tab.selected.indexOf(i) === -1);
};

/**
 * @param {number} tabId
 */
TabService.prototype.selectAll = function(tabId) {
  this.entities[tabId].selected = this.visibleFiles[tabId].map((_, i) => i);
};

/**
 * @param {{ id: number, pattern: string }} props
 */
TabService.prototype.selectGlob = function(props) {
  if (!props.pattern) {
    return;
  }

  const tab = this.entities[props.id];

  tab.selected = this.visibleFiles[props.id]
    .map((file, i) => GLib.pattern_match_simple(props.pattern, file.name)
      ? i
      : tab.selected.indexOf(i))
    .filter((i) => i !== -1);
};

/**
 * @param {{ selected: number[], tabId: number }} props
 */
TabService.prototype.selected = function(props) {
  this.entities[props.tabId].selected = props.selected;
};

/**
 * @param {{ files: any[], id: number, location: string }} props
 */
TabService.prototype.set = function(props) {
  const tab = this.entities[props.id];

  let visibleFiles = this.visibleFiles[props.id];
  const cursorUri = visibleFiles[tab.cursor].uri;
  const selectedUris = tab.selected.map(i => visibleFiles[i].uri);

  tab.files = observable.shallowArray(sortFiles(tab.sortedBy, props.files));
  tab.location = props.location;

  visibleFiles = this.visibleFiles[props.id];
  const cursor = visibleFiles.findIndex(file => file.uri === cursorUri);

  tab.cursor = cursor === -1
    ? Math.min(tab.cursor, visibleFiles.length - 1)
    : cursor;

  const selected = [];
  for (let i = 0; i < visibleFiles.length; i++) {
    if (selectedUris.indexOf(visibleFiles[i].uri) !== -1) {
      selected.push(i);
    }
  }
  tab.selected = selected;
};

/**
 * @param {{ by: string, tabId: number }} props
 */
TabService.prototype.sorted = function(props) {
  const tab = this.entities[props.tabId];
  tab.sortedBy = nextSort(tab.sortedBy, props.by);

  this.set({
    files: tab.files,
    id: props.tabId,
    location: tab.location,
  });
};

/**
 * @param {number} tabId
 */
TabService.prototype.getVisibleFiles = function(tabId) {
  const { files } = this.entities[tabId];

  if (this.showHidSys) {
    return files.filter(file => file.name !== ".");
  }

  return files.filter(file => file.name[0] !== "." || file.name === "..");
};

exports.nextSort = nextSort;
function nextSort(prevBy, by) {
  if (by === "filename" && prevBy !== "filename") {
    return "filename";
  }
  if (by === "filename" && prevBy === "filename") {
    return "-filename";
  }
  if (by === "ext" && prevBy !== "ext") {
    return "ext";
  }
  if (by === "ext" && prevBy === "ext") {
    return "-ext";
  }
  if (by === "mtime" && prevBy !== "mtime") {
    return "mtime";
  }
  if (by === "mtime" && prevBy === "mtime") {
    return "-mtime";
  }
  return prevBy;
}

exports.sortFiles = sortFiles;
function sortFiles(by, files) {
  switch (by) {
    case "filename":
      return orderBy(
        files,
        [
          x => x.fileType === FileType.DIRECTORY,
          x => x.name.toLowerCase(),
        ],
        ["desc", "asc"],
      );

    case "-filename":
      return orderBy(
        files,
        [
          x => x.fileType === FileType.DIRECTORY,
          x => x.name.toLowerCase(),
        ],
        ["desc", "desc"],
      );

    case "ext":
      return orderBy(
        files,
        [
          x => x.fileType === FileType.DIRECTORY,
          x => {
            const matches = /^(.+)\.(.*?)$/.exec(x.name);
            return matches && x.fileType !== FileType.DIRECTORY ? matches[2].toLowerCase() : "";
          },
          x => x.name.toLowerCase(),
        ],
        ["desc", "asc", "asc"],
      );

    case "-ext":
      return orderBy(
        files,
        [
          x => x.fileType === FileType.DIRECTORY,
          x => {
            const matches = /^(.+)\.(.*?)$/.exec(x.name);
            return matches && x.fileType !== FileType.DIRECTORY ? matches[2].toLowerCase() : "";
          },
          x => x.name.toLowerCase(),
        ],
        ["desc", "desc", "desc"],
      );

    case "mtime":
      return orderBy(
        files,
        [
          x => x.fileType === FileType.DIRECTORY,
          "modificationTime",
          x => x.name.toLowerCase(),
        ],
        ["desc", "asc", "asc"],
      );

    case "-mtime":
      return orderBy(
        files,
        [
          x => x.fileType === FileType.DIRECTORY,
          "modificationTime",
          x => x.name.toLowerCase(),
        ],
        ["desc", "desc", "desc"],
      );

    default:
      return files;
  }
}

exports.TabService = TabService;
