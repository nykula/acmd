const { AppInfo, File, FileType } = imports.gi.Gio;
const { concat, map, parallel, waterfall } = require("async");
const { uniqBy } = require("lodash");
const { parse } = require("nextstep-plist");
const nullthrows = require("nullthrows").default;
const { FileHandler } = require("../../domain/File/FileHandler");
const { DialogService } = require("../Dialog/DialogService");
const { DirectoryService } = require("../Directory/DirectoryService");
const { GioService } = require("../Gio/GioService");
const { autoBind } = require("../Gjs/autoBind");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");
const { UriService } = require("../Uri/UriService");

/**
 * File under cursor in active tab.
 */
class CursorService {
  /**
   * @typedef IProps
   * @property {DialogService?} [dialogService]
   * @property {DirectoryService?} [directoryService]
   * @property {GioService?} [gioService]
   * @property {PanelService?} [panelService]
   * @property {TabService?} [tabService]
   * @property {UriService?} [uriService]
   *
   * @param {IProps} props
   */
  constructor(props) {
    this.AppInfo = AppInfo;
    this.env = process.env;
    this.File = File;
    this.fileAttributes = "standard::*,time::*,unix::*";
    this.props = props;

    autoBind(this, CursorService.prototype, __filename);
  }

  /**
   * Opens file in terminal, with EDITOR environment variable.
   */
  edit() {
    const { alert } = nullthrows(this.props.dialogService);
    const { terminal } = nullthrows(this.props.directoryService);
    const { unescape } = nullthrows(this.props.uriService);

    const editor = this.env.EDITOR;

    if (!editor) {
      alert(`You have to define EDITOR environment variable.`);
      return;
    }

    const file = this.getCursor();
    const match = /^file:\/\/(.+)/.exec(file.uri);

    if (!match) {
      alert(`${file.uri} is not local.`);
      return;
    }

    terminal(["-e", editor, unescape(match[1])]);
  }

  /**
   * Gets content type of a given file, and apps that can open it.
   *
   * @param {string} uri
   * @param {(error?: Error, result?: { contentType: string, handlers: FileHandler[] }) => void} callback
   */
  getHandlers(uri, callback) {
    const { communicate } = nullthrows(this.props.gioService);

    communicate(["uname"], (error, platform) => {
      if (!platform) {
        callback(error);
        return;
      }

      if (platform.split("\n")[0] === "Darwin") {
        this.getHandlersDarwin(uri, callback);
      } else {
        this.getHandlersNative(uri, callback);
      }
    });
  }

  open() {
    const { alert } = /** @type {DialogService} */ (this.props.dialogService);

    const { launch } = /** @type {GioService} */ (this.props.gioService);

    const {
      levelUp,
      ls,
    } = /** @type {PanelService} */ (this.props.panelService);

    const { fileType, name, uri } = this.getCursor();

    if (name === "..") {
      levelUp();
      return;
    }

    if (fileType === FileType.DIRECTORY) {
      ls(uri);
      return;
    }

    this.getHandlers(uri, (error, result) => {
      if (!result) {
        alert(String(error));
        return;
      }

      const { contentType, handlers } = result;

      if (!handlers.length) {
        alert("No handlers registered for " + contentType + ".");
        return;
      }

      launch(handlers[0], [uri]);
    });
  }

  /**
   * Opens file in terminal, with PAGER environment variable.
   */
  view() {
    const { alert } = nullthrows(this.props.dialogService);
    const { terminal } = nullthrows(this.props.directoryService);
    const { unescape } = nullthrows(this.props.uriService);

    const pager = this.env.PAGER;

    if (!pager) {
      alert(`You have to define PAGER environment variable.`);
      return;
    }

    const file = this.getCursor();
    const match = /^file:\/\/(.+)/.exec(file.uri);

    if (!match) {
      alert(`${file.uri} is not local.`);
      return;
    }

    terminal(["-e", pager, unescape(match[1])]);
  }

  /**
   * Returns whether macOS app can open file.
   *
   * @private
   * @param {{ contentType: string, info: any, type: string, uri: string }} props
   */
  canHandle(props) {
    const { contentType, info, type, uri } = props;

    const docs = info.CFBundleDocumentTypes || [];

    for (const doc of docs) {
      if (
        doc.LSItemContentTypes &&
        doc.LSItemContentTypes.indexOf(type) !== -1
      ) {
        return true;
      }

      /** @type {string[]} */
      const exts = doc.CFBundleTypeExtensions || [];

      for (const ext of exts) {
        if (uri.slice(-ext.length - 1) === `.${ext}`) {
          return true;
        }
      }
    }

    /** @type {string[]} */
    const mimes = info.CFBundleTypeMIMETypes || [];

    if (mimes.indexOf(contentType) !== -1) {
      return true;
    }

    return false;
  }

  /**
   * @private
   */
  getCursor() {
    const {
      getActiveTabId,
    } = /** @type {PanelService} */ (this.props.panelService);

    const { getCursor } = /** @type {TabService} */ (this.props.tabService);

    return getCursor(getActiveTabId());
  }

  /**
   * Returns default handlers set by macOS user.
   *
   * @private
   * @param {(error?: Error, defaults?: { [type: string]: string }) => void} callback
   */
  getDefaults(callback) {
    const { communicate } = nullthrows(this.props.gioService);

    communicate(
      [
        "defaults",
        "read",
        "com.apple.LaunchServices/com.apple.launchservices.secure",
        "LSHandlers",
      ],

      (error, stdout) => {
        if (!stdout) {
          callback(error);
          return;
        }

        /**
         * @type {any[]}
         */
        let handlers = [];

        try {
          handlers = parse(stdout);
        } catch (error) {
          callback(error);
          return;
        }

        /** @type {{ [type: string]: string }} */
        const defaults = {};

        for (let i = handlers.length - 1; i >= 0; i--) {
          const handler = handlers[i];

          if (handler.LSHandlerContentType) {
            defaults[handler.LSHandlerContentType] = handler.LSHandlerRoleAll;
          }
        }

        callback(undefined, defaults);
      },
    );
  }

  /**
   * Returns macOS apps that can open file.
   *
   * @private
   * @param {string} uri
   * @param {(error?: Error, result?: { contentType: string, handlers: FileHandler[] }) => void} callback
   */
  getHandlersDarwin(uri, callback) {
    const file = this.File.new_for_uri(uri);

    let contentType = "";
    let defaults = /** @type {{ [type: string]: string }} */ {};
    let types = [""];

    waterfall(
      [
        /**
         * @param {any} next
         */
        next => {
          const { ls, queryInfo } = nullthrows(this.props.gioService);

          const dirs = [
            "file:///Applications",
            "file:///System/Library/CoreServices/Applications",
          ];

          parallel(
            [
              this.getDefaults,
              _ => this.getTypesDarwin(uri, _),
              _ => queryInfo(file, _),
              _ => concat(dirs, ls, _),
            ],

            next,
          );
        },

        /**
         * @param {any[]} results
         * @param {any} next
         */
        (results, next) => {
          [defaults, types] = results;
          contentType = results[2].get_content_type();

          /** @type {{ fileType: number, name: string, uri: string }[]} */
          let files = results[3];

          files = files.filter(
            x =>
              x.fileType === FileType.DIRECTORY &&
              x.name !== "." &&
              x.name !== "..",
          );

          const plists = files.map(x =>
            this.File.new_for_uri(x.uri).resolve_relative_path(
              "Contents/Info.plist",
            ),
          );

          map(plists, this.readPlist, next);
        },
      ],

      (error, infos) => {
        if (!infos) {
          callback(error);
          return;
        }

        /** @type {FileHandler[]} */
        const handlers = [];

        for (const type of types) {
          for (const info of infos) {
            const canHandle = this.canHandle({
              contentType,
              info,
              type,
              uri,
            });

            if (!canHandle) {
              continue;
            }

            const handler = {
              commandline: `open -b ${info.CFBundleIdentifier} %U`,

              displayName:
                info.CFBundleDisplayName ||
                info.CFBundleName ||
                info.CFBundleExecutable || // Inkscape.
                info.CFBundleIdentifier,

              icon: null,
            };

            if (defaults[type] === info.CFBundleIdentifier) {
              handlers.unshift(handler);
            } else {
              handlers.push(handler);
            }

            infos = infos.filter((/** @type {any} */ x) => x !== info);
          }
        }

        callback(undefined, {
          contentType,
          handlers,
        });
      },
    );
  }

  /**
   * Returns native apps that can open file.
   *
   * @private
   * @param {string} uri
   * @param {(error?: Error, result?: { contentType: string, handlers: FileHandler[] }) => void} callback
   */
  getHandlersNative(uri, callback) {
    const { queryInfo } = nullthrows(this.props.gioService);
    const file = this.File.new_for_uri(uri);

    queryInfo(file, (error, info) => {
      if (!info) {
        callback(error);
        return;
      }

      const contentType = info.get_content_type();

      /** @type {AppInfo[]} */
      const apps = this.AppInfo.get_all_for_type(contentType);

      const def = this.AppInfo.get_default_for_type(contentType, false);
      if (def) {
        apps.unshift(def);
      }

      let handlers = apps.map(app => {
        const icon = app.get_icon();
        return {
          commandline: app.get_commandline(),
          displayName: app.get_display_name(),
          icon: icon ? icon.to_string() : null,
        };
      });

      handlers = uniqBy(handlers, x => x.commandline);

      callback(undefined, {
        contentType,
        handlers,
      });
    });
  }

  /**
   * Returns macOS content types for a given file.
   *
   * @private
   * @param {string} uri
   * @param {(error?: Error, result?: string[]) => void} callback
   */
  getTypesDarwin(uri, callback) {
    if (uri.indexOf("file://") !== 0) {
      callback(undefined, []);
      return;
    }

    const { communicate } = nullthrows(this.props.gioService);
    const { unescape } = nullthrows(this.props.uriService);

    communicate(
      ["mdls", "-name", "kMDItemContentTypeTree", unescape(uri)],

      (error, stdout) => {
        if (!stdout) {
          callback(error);
          return;
        }

        let types = [];
        stdout = stdout.replace("kMDItemContentTypeTree = ", "");

        try {
          types = parse(stdout);
        } catch (error) {
          callback(error);
          return;
        }

        callback(undefined, types);
      },
    );
  }

  /**
   * Reads file contents as NeXTSTEP property list.
   *
   * @private
   * @param {File} file
   * @param {(error?: Error, data?: any) => void} callback
   */
  readPlist(file, callback) {
    const { communicate } = nullthrows(this.props.gioService);

    communicate(
      ["plutil", "-convert", "json", "-o", "-", file.get_path()],

      (error, json) => {
        if (!json) {
          callback(error);
          return;
        }

        if (json[0] !== "{") {
          // File does not exist.
          callback(undefined, {});
          return;
        }

        let data = {};

        try {
          data = JSON.parse(json);
        } catch (jsonError) {
          callback(jsonError);
          return;
        }

        callback(undefined, data);
      },
    );
  }
}

exports.CursorService = CursorService;
