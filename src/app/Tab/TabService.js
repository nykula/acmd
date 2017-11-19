const { FileType } = imports.gi.Gio;
const { action, computed, extendObservable, observable } = require("mobx");
const orderBy = require("lodash/orderBy");
const { autoBind } = require("../Gjs/autoBind");
const { File } = require("../../domain/File/File");
const { Tab } = require("../../domain/Tab/Tab");

function TabService() {
  autoBind(this, TabService.prototype, __filename);

  extendObservable(this, {
    cursor: action(this.cursor),
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
    set: action(this.set),
    showHidSys: this.showHidSys,
    sorted: action(this.sorted),
    visibleFiles: {
      "0": computed(this.getVisibleFiles.bind(this, 0)),
      "1": computed(this.getVisibleFiles.bind(this, 1)),
    },
  });
}

const sampleFiles = [
  {
    name: "..",
    fileType: FileType.DIRECTORY,
    icon: "folder",
    iconType: "ICON_NAME",
    size: 0,
    modificationTime: Date.now(),
    mode: "0755",
  },
  {
    name: "clan in da front.txt",
    fileType: FileType.REGULAR,
    icon: "text-x-generic",
    iconType: "ICON_NAME",
    size: 4110,
    modificationTime: Date.now(),
    mode: "0644",
  },
];

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
 * @param {{ selected: number[], tabId: number }} props
 */
TabService.prototype.selected = function(props) {
  this.entities[props.tabId].selected = props.selected;
};

/**
 * @param {{ files: any[], id: number, location: string, sortedBy?: string }} props
 */
TabService.prototype.set = function(props) {
  const tab = this.entities[props.id];
  const sortedBy = props.sortedBy || tab.sortedBy;

  tab.files = observable.shallowArray(sortFiles(sortedBy, props.files));
  tab.location = props.location;

  const visibleFiles = this.visibleFiles[props.id];

  tab.cursor = Math.min(tab.cursor, visibleFiles.length);
  tab.selected = tab.selected.filter(x => x < visibleFiles.length);
};

/**
 * @param {{ by: string, tabId: number }} props
 */
TabService.prototype.sorted = function(props) {
  const tab = this.entities[props.tabId];

  const by = nextSort(tab.sortedBy, props.by);
  const files = sortFiles(by, tab.files);

  tab.sortedBy = by;
  tab.files = files;
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
