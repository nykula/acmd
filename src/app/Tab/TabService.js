const { FileType } = imports.gi.Gio;
const GLib = imports.gi.GLib;
const noop = require("lodash/noop");
const orderBy = require("lodash/orderBy");
const {
  action,
  decorate,
  extendObservable,
  observable,
  runInAction,
} = require("mobx");
const { File } = require("../../domain/File/File");
const { Tab } = require("../../domain/Tab/Tab");
const { GioService } = require("../Gio/GioService");
const { autoBind } = require("../Gjs/autoBind");

/**
 * Files visible in panel tabs.
 */
class TabService {
  /**
   * @private
   * @param {string} by
   * @param {File[]} files
   */
  static sortFiles(by, files) {
    switch (by) {
      case "filename":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "asc"],
        );

      case "-filename":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "desc"],
        );

      case "ext":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            x => {
              const matches = /^(.+)\.(.*?)$/.exec(x.name);
              return matches && x.fileType !== FileType.DIRECTORY
                ? matches[2].toLowerCase()
                : "";
            },
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "asc", "asc"],
        );

      case "-ext":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            x => {
              const matches = /^(.+)\.(.*?)$/.exec(x.name);
              return matches && x.fileType !== FileType.DIRECTORY
                ? matches[2].toLowerCase()
                : "";
            },
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "desc", "desc"],
        );

      case "size":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            "size",
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "asc", "asc"],
        );

      case "-size":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            "size",
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "desc", "desc"],
        );

      case "mtime":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            "modificationTime",
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "asc", "asc"],
        );

      case "-mtime":
        return orderBy(
          files,
          [
            x => x.name === "..",
            x => x.fileType === FileType.DIRECTORY,
            "modificationTime",
            x => x.name.toLowerCase(),
          ],
          ["desc", "desc", "desc", "desc"],
        );

      default:
        return files;
    }
  }

  /**
   * @param {{ gioService: GioService }} props
   */
  constructor(props) {
    /**
     * @type {{ [ id: number ]: Tab }}
     */
    this.entities = {
      0: {
        cursor: 0,
        files: observable.array(
          TabService.sampleFiles,
          { deep: false },
        ),
        location: "file:///",
        selected: [],
        sortedBy: "ext",
      },
      1: {
        cursor: 0,
        files: observable.array(
          TabService.sampleFiles,
          { deep: false },
        ),
        location: "file:///",
        selected: [],
        sortedBy: "ext",
      },
    };

    /** @type {boolean} */
    this.isGrid = false;

    this.props = props;

    this.showHidSys = false;

    const self = this;

    /** @type {{ [id: string]: File[] }} */
    this.visibleFiles = extendObservable(
      {},
      {
        get 0() { return self.getVisibleFiles(0); },
        get 1() { return self.getVisibleFiles(1); },
      },
    );

    autoBind(this, TabService.prototype, __filename);
  }

  /**
   * @param {{ cursor: number, tabId: number }} props
   */
  cursor(props) {
    this.entities[props.tabId].cursor = props.cursor;
  }

  /**
   * @param {number} tabId
   */
  deselectAll(tabId) {
    this.entities[tabId].selected.splice(0);
  }

  /**
   * @param {{ id: number, pattern: string }} props
   */
  deselectGlob(props) {
    if (!props.pattern) {
      return;
    }
    const tab = this.entities[props.id];
    const visibleFiles = this.visibleFiles[props.id];
    tab.selected = tab.selected.filter(
      i => !GLib.pattern_match_simple(props.pattern, visibleFiles[i].name),
    );
  }

  /**
   * @param {number} id
   */
  getCursor(id) {
    const { cursor } = this.entities[id];
    const files = this.visibleFiles[id];
    const file = files[cursor];
    return file;
  }

  /**
   * @param {number} tabId
   */
  invert(tabId) {
    const tab = this.entities[tabId];
    tab.selected = this.visibleFiles[tabId]
      .map((_, i) => i)
      .filter(i => !this.isDotdot(tabId, i))
      .filter(i => tab.selected.indexOf(i) === -1);
  }

  /**
   * @param {number} id
   * @param {string} uri
   * @param {(error?: Error) => void} callback
   */
  ls(id, uri, callback = noop) {
    const { gioService } = this.props;

    gioService.ls(uri, (error, files) => {
      if (!files) {
        callback(error);
        return;
      }

      runInAction(() => {
        this.set({
          files,
          id,
          location: uri,
        });

        callback();
      });
    });
  }

  /**
   * @param {number} tabId
   */
  selectAll(tabId) {
    this.entities[tabId].selected = this.visibleFiles[tabId]
      .map((_, i) => i)
      .filter(i => !this.isDotdot(tabId, i));
  }

  /**
   * @param {number} id
   * @param {number} id1
   */
  selectDiff(id, id1) {
    const files = this.visibleFiles[id];
    const files1 = this.visibleFiles[id1];
    /** @type {number[]} */
    const selected = [];
    /** @type {number[]} */
    const selected0 = [];
    for (let i = 0; i < files.length; i++) {
      if (this.hasDiff(files[i], files1)) {
        selected.push(i);
      }
    }
    for (let i = 0; i < files1.length; i++) {
      if (this.hasDiff(files1[i], files)) {
        selected0.push(i);
      }
    }
    this.entities[id].selected = selected;
    this.entities[id1].selected = selected0;
  }

  /**
   * @param {{ id: number, pattern: string }} props
   */
  selectGlob(props) {
    if (!props.pattern) {
      return;
    }
    const tab = this.entities[props.id];
    tab.selected = this.visibleFiles[props.id]
      .map(
        (file, i) =>
          GLib.pattern_match_simple(props.pattern, file.name)
            ? i
            : tab.selected.indexOf(i),
    )
      .filter(i => i !== -1 && !this.isDotdot(props.id, i));
  }

  /**
   * @param {number} id
   * @param {number[]} selected
   */
  selected(id, selected) {
    this.entities[id].selected = selected;
  }

  /**
   * @param {{ files: any[], id: number, location: string }} props
   */
  set(props) {
    const tab = this.entities[props.id];
    let visibleFiles = this.visibleFiles[props.id];

    const cursorUri = visibleFiles.length > tab.cursor
      ? visibleFiles[tab.cursor].uri
      : undefined;

    const selectedUris = tab.selected.map(i => visibleFiles[i].uri);

    tab.files = observable.array(
      TabService.sortFiles(tab.sortedBy, props.files),
      { deep: false },
    );

    tab.location = props.location;

    visibleFiles = this.visibleFiles[props.id];

    const cursor = visibleFiles.findIndex(file => file.uri === cursorUri);

    tab.cursor =
      cursor === -1
        ? Math.max(0, Math.min(tab.cursor, visibleFiles.length - 1))
        : cursor;

    const selected = [];

    for (let i = 0; i < visibleFiles.length; i++) {
      if (selectedUris.indexOf(visibleFiles[i].uri) !== -1) {
        selected.push(i);
      }
    }

    tab.selected = selected;
  }

  /**
   * @param {{ by: string, tabId: number }} props
   */
  sorted(props) {
    const tab = this.entities[props.tabId];

    const { by } = props;
    tab.sortedBy = tab.sortedBy === by ? `-${by}` : by;

    this.set({
      files: tab.files,
      id: props.tabId,
      location: tab.location,
    });
  }

  toggleGrid() {
    this.isGrid = !this.isGrid;
  }

  /**
   * @private
   * @param {number} tabId
   */
  getVisibleFiles(tabId) {
    const { files } = this.entities[tabId];
    if (this.showHidSys) {
      return files.filter(file => file.name !== ".");
    }
    return files.filter(file => file.name[0] !== "." || file.name === "..");
  }

  /**
   * @private
   * @param {File} file
   * @param {File[]} files1
   */
  hasDiff(file, files1) {
    if (file.name === "..") {
      return false;
    }
    for (const file1 of files1) {
      if (file.name !== file1.name) {
        continue;
      }
      if (file.size !== file1.size) {
        continue;
      }
      if (file.modificationTime !== file1.modificationTime) {
        continue;
      }
      return false;
    }
    return true;
  }

  /**
   * @private
   * @param {number} id
   * @param {number} index
   */
  isDotdot(id, index) {
    return this.visibleFiles[id][index].name === "..";
  }
}

decorate(TabService, {
  cursor: action,
  deselectAll: action,
  deselectGlob: action,
  entities: observable,
  invert: action,
  isGrid: observable,
  selectAll: action,
  selectDiff: action,
  selectGlob: action,
  selected: action,
  set: action,
  showHidSys: observable,
  sorted: action,
  toggleGrid: action,
});

/**
 * @static
 * @type {File[]}
 */
TabService.sampleFiles = [
  {
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
  },
];

exports.TabService = TabService;
