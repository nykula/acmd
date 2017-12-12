const { FileType } = imports.gi.Gio;
const GLib = imports.gi.GLib;
const noop = require("lodash/noop");
const orderBy = require("lodash/orderBy");
const {
  action,
  computed,
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
          [x => x.fileType === FileType.DIRECTORY, x => x.name.toLowerCase()],
          ["desc", "asc"],
        );

      case "-filename":
        return orderBy(
          files,
          [x => x.fileType === FileType.DIRECTORY, x => x.name.toLowerCase()],
          ["desc", "desc"],
        );

      case "ext":
        return orderBy(
          files,
          [
            x => x.fileType === FileType.DIRECTORY,
            x => {
              const matches = /^(.+)\.(.*?)$/.exec(x.name);
              return matches && x.fileType !== FileType.DIRECTORY
                ? matches[2].toLowerCase()
                : "";
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
              return matches && x.fileType !== FileType.DIRECTORY
                ? matches[2].toLowerCase()
                : "";
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
        files: observable.shallowArray(TabService.sampleFiles),
        location: "file:///",
        selected: [],
        sortedBy: "ext",
      },
      1: {
        cursor: 0,
        files: observable.shallowArray(TabService.sampleFiles),
        location: "file:///",
        selected: [],
        sortedBy: "ext",
      },
    };

    this.props = props;

    this.showHidSys = false;

    /** @type {{ [id: string]: File[] }} */
    this.visibleFiles = {};

    autoBind(this, TabService.prototype, __filename);

    extendObservable(this, {
      cursor: action(this.cursor),
      deselectAll: action(this.deselectAll),
      deselectGlob: action(this.deselectGlob),
      entities: this.entities,
      invert: action(this.invert),
      selectAll: action(this.selectAll),
      selectDiff: action(this.selectDiff),
      selectGlob: action(this.selectGlob),
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
      .filter(i => tab.selected.indexOf(i) === -1);
  }

  /**
   * @param {number} id
   * @param {string} uri
   * @param {((error?: Error) => void)=} callback
   */
  ls(id, uri, callback = noop) {
    const { gioService } = this.props;

    gioService.ls(uri, (error, files) => {
      if (error) {
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
    this.entities[tabId].selected = this.visibleFiles[tabId].map((_, i) => i);
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
      .filter(i => i !== -1);
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
    const cursorUri = visibleFiles[tab.cursor].uri;
    const selectedUris = tab.selected.map(i => visibleFiles[i].uri);
    tab.files = observable.shallowArray(
      TabService.sortFiles(tab.sortedBy, props.files),
    );
    tab.location = props.location;
    visibleFiles = this.visibleFiles[props.id];
    const cursor = visibleFiles.findIndex(file => file.uri === cursorUri);
    tab.cursor =
      cursor === -1 ? Math.min(tab.cursor, visibleFiles.length - 1) : cursor;
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
}

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
