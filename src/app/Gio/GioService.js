const Gio = imports.gi.Gio;
const {
  AppInfo,
  AppInfoCreateFlags,
  FileCreateFlags,
  FileInfo,
  FileQueryInfoFlags,
  Mount,
  SubprocessFlags,
} = Gio;
const GioFile = Gio.File;
const { MAXINT32, PRIORITY_DEFAULT } = imports.gi.GLib;
const { map, waterfall } = require("async");
const find = require("lodash/find");
const noop = require("lodash/noop");
const uniqBy = require("lodash/uniqBy");
const { File } = require("../../domain/File/File");
const { FileHandler } = require("../../domain/File/FileHandler");
const { Place } = require("../../domain/Place/Place");
const { autoBind } = require("../Gjs/autoBind");
const { gioAsync } = require("./gioAsync");

/**
 * Let the front-end use drives.
 */
function GioService(_Gio = Gio) {
  autoBind(this, GioService.prototype, __filename);

  this.fileAttributes = "standard::*,time::*,unix::*";
  this.Gio = _Gio;
}

/**
 * Opens URIs in an application.
 *
 * @param {FileHandler} handler
 * @param {string[]} uris
 */
GioService.prototype.launch = function(handler, uris) {
  const gAppInfo = this.Gio.AppInfo.create_from_commandline(
    handler.commandline,
    null,
    AppInfoCreateFlags.NONE,
  );

  const gFiles = uris.map(x => this.Gio.File.new_for_uri(x));
  gAppInfo.launch(gFiles, null);
};

/**
 * Lists every file in a given directory.
 *
 * @param {string} uri
 * @param {(error: Error, files: File[]) => void} callback
 */
GioService.prototype.ls = function(uri, callback) {
  /**
   * @type {File[]}
   */
  let files = [];

  const dir = this.Gio.File.new_for_uri(uri);
  const parent = dir.get_parent();

  /**
   * @param {any} _callback
   */
  const handleRequest = _callback => {
    gioAsync(
      dir,
      "query_info",
      this.fileAttributes,
      FileQueryInfoFlags.NONE,
      PRIORITY_DEFAULT,
      null,
      _callback,
    );
  };

  /**
   * @param {FileInfo} selfInfo
   * @param {any} _callback
   */
  const handleSelf = (selfInfo, _callback) => {
    const selfFile = mapGFileInfoToFile(selfInfo);
    selfFile.displayName = ".";
    selfFile.mountUri = this.getMountUri(dir);
    selfFile.name = ".";
    selfFile.uri = dir.get_uri();
    files = [selfFile];

    if (!parent) {
      _callback(null, null);
      return;
    }

    gioAsync(
      parent,
      "query_info",
      this.fileAttributes,
      FileQueryInfoFlags.NONE,
      PRIORITY_DEFAULT,
      null,
      _callback,
    );
  };

  /**
   * @param {FileInfo} parentInfo
   * @param {any} _callback
   */
  const handleParent = (parentInfo, _callback) => {
    if (parentInfo) {
      const parentFile = mapGFileInfoToFile(parentInfo);
      parentFile.displayName = "..";
      parentFile.name = "..";
      parentFile.icon = "go-up";
      parentFile.iconType = "ICON_NAME";
      parentFile.uri = parent.get_uri();
      files = files.concat(parentFile);
    }

    gioAsync(
      dir,
      "enumerate_children",
      this.fileAttributes,
      FileQueryInfoFlags.NONE,
      PRIORITY_DEFAULT,
      null,
      _callback,
    );
  };

  /**
   * @param {any} enumerator
   * @param {any} _callback
   */
  const handleChildren = (enumerator, _callback) => {
    gioAsync(
      enumerator,
      "next_files",
      MAXINT32,
      PRIORITY_DEFAULT,
      null,
      _callback,
    );
  };

  /**
   * @param {FileInfo[]} list
   * @param {any} _callback
   */
  const handleInfos = (list, _callback) => {
    files = files.concat(list.map(mapGFileInfoToFile));
    _callback(null, files);
  };

  /**
   * @param {FileInfo} gFileInfo
   */
  const mapGFileInfoToFile = gFileInfo => {
    const mode = gFileInfo.get_attribute_as_string("unix::mode");
    const name = gFileInfo.get_name();

    /** @type {File} */
    const file = {
      displayName: gFileInfo.get_display_name(),
      fileType: gFileInfo.get_file_type(),
      icon: gFileInfo.get_icon().to_string(),
      iconType: "GICON",
      mode: Number(mode)
        .toString(8)
        .slice(-4),
      modificationTime: gFileInfo.get_modification_time().tv_sec,
      mountUri: "",
      name: name,
      size: gFileInfo.get_size(),
      uri: dir.get_child(name).get_uri(),
    };

    return file;
  };

  waterfall(
    [handleRequest, handleSelf, handleParent, handleChildren, handleInfos],
    callback,
  );
};

/**
 * Gets content type of a given file, and apps that can open it.
 *
 * @param {string} uri
 * @param {(error: Error, result: { contentType: string, handlers: FileHandler[] }) => void} callback
 */
GioService.prototype.getHandlers = function(uri, callback) {
  const file = this.Gio.File.new_for_uri(uri);

  gioAsync(
    file,
    "query_info",
    this.fileAttributes,
    FileQueryInfoFlags.NONE,
    PRIORITY_DEFAULT,
    null,
    (/** @type {Error} */ error, /** @type {FileInfo} */ gFileInfo) => {
      if (error) {
        callback(error);
        return;
      }

      const contentType = gFileInfo.get_content_type();

      /** @type {AppInfo[]} */
      const gAppInfos = this.Gio.AppInfo.get_all_for_type(contentType);

      const def = this.Gio.AppInfo.get_default_for_type(contentType, false);
      if (def) {
        gAppInfos.unshift(def);
      }

      let handlers = gAppInfos.map(gAppInfo => {
        const icon = gAppInfo.get_icon();
        return {
          commandline: gAppInfo.get_commandline(),
          displayName: gAppInfo.get_display_name(),
          icon: icon ? icon.to_string() : null,
        };
      });

      handlers = uniqBy(handlers, x => x.commandline);

      callback(null, {
        contentType,
        handlers,
      });
    },
  );
};

/**
 * Returns root uri of the mount enclosing a given file.
 *
 * @param {GioFile} gFile
 */
GioService.prototype.getMountUri = function(gFile) {
  let mount = null;

  try {
    mount = gFile.find_enclosing_mount(null);
  } catch (err) {
    return "file:///";
  }

  return mount.get_root().get_uri();
};

/**
 * Creates a directory.
 *
 * @param {string} uri
 * @param {(error: Error) => void} callback
 */
GioService.prototype.mkdir = function(uri, callback) {
  gioAsync(
    this.Gio.File.new_for_uri(uri),
    "make_directory",
    PRIORITY_DEFAULT,
    null,
    callback,
  );
};

/**
 * Creates a file.
 *
 * @param {string} uri
 * @param {(error: Error) => void} callback
 */
GioService.prototype.touch = function(uri, callback) {
  gioAsync(
    this.Gio.File.new_for_uri(uri),
    "create",
    FileCreateFlags.NONE,
    PRIORITY_DEFAULT,
    null,
    callback,
  );
};

/**
 * Spawns a subprocess in a given working directory.
 *
 * @param {{ argv: string[], cwd?: string }} props
 */
GioService.prototype.spawn = function(props) {
  const { argv, cwd } = props;
  const launcher = new this.Gio.SubprocessLauncher();

  if (cwd) {
    launcher.set_cwd(cwd);
  }

  launcher.set_flags(SubprocessFlags.NONE);
  return launcher.spawnv(argv);
};

/**
 * Runs a subprocess and returns its output.
 *
 * @param {string[]} argv
 * @param {(error: Error, stdout: string) => void} callback
 */
GioService.prototype.communicate = function(argv, callback = noop) {
  const subprocess = new this.Gio.Subprocess({
    argv,
    flags: SubprocessFlags.STDOUT_PIPE,
  });

  subprocess.init(null);

  gioAsync(subprocess, "communicate_utf8", null, null, (
    /** @type {any} */
    _,
    /** @type {string[]} */
    result,
  ) => {
    const stdout = result[1];
    callback(null, stdout);
  });
};

exports.GioService = GioService;
