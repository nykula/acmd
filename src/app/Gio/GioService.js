// tslint:disable:variable-name

const Gio = imports.gi.Gio;
const {
  AppInfoCreateFlags,
  FileCreateFlags,
  FileEnumerator,
  FileInfo,
  FileQueryInfoFlags,
  SubprocessFlags,
} = Gio;
const GioFile = Gio.File;
const { MAXINT32, PRIORITY_DEFAULT } = imports.gi.GLib;
const { waterfall } = require("async");
const { noop } = require("lodash");
const { File } = require("../../domain/File/File");
const { FileHandler } = require("../../domain/File/FileHandler");
const { autoBind } = require("../Gjs/autoBind");
const { GioAsync } = require("./GioAsync");

/**
 * Let the front-end use drives.
 */
class GioService {
  constructor(_Gio = Gio) {
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
  launch(handler, uris) {
    const gAppInfo = this.Gio.AppInfo.create_from_commandline(
      handler.commandline,
      null,
      AppInfoCreateFlags.NONE,
    );

    const gFiles = uris.map(x => this.Gio.File.new_for_uri(x));
    gAppInfo.launch(gFiles, null);
  }

  /**
   * Lists every file in a given directory.
   *
   * @param {string} uri
   * @param {(error?: Error, files?: File[]) => void} callback
   */
  ls(uri, callback) {
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
      this.queryInfo(dir, _callback);
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

      this.queryInfo(parent, _callback);
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
        parentFile.uri = (/** @type {GioFile} */ (parent)).get_uri();
        files = files.concat(parentFile);
      }

      GioAsync(
        (readyCallback) => dir.enumerate_children_async(
          this.fileAttributes,
          FileQueryInfoFlags.NONE,
          PRIORITY_DEFAULT,
          null,
          readyCallback,
        ),

        result => dir.enumerate_children_finish(result),

        _callback,
      );
    };

    /**
     * @param {FileEnumerator} enumerator
     * @param {any} _callback
     */
    const handleChildren = (enumerator, _callback) => {
      GioAsync(
        readyCallback => enumerator.next_files_async(
          MAXINT32,
          PRIORITY_DEFAULT,
          null,
          readyCallback,
        ),

        result => enumerator.next_files_finish(result),

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

      const icon = gFileInfo.get_icon().to_string();

      /** @type {File} */
      const file = {
        displayName: gFileInfo.get_display_name(),
        fileType: gFileInfo.get_file_type(),
        icon: icon || "text-x-generic",
        iconType: icon ? "GICON" : "ICON_NAME",
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
  }

  /**
   * Returns root uri of the mount enclosing a given file.
   *
   * @param {GioFile} gFile
   */
  getMountUri(gFile) {
    let mount = null;

    try {
      mount = gFile.find_enclosing_mount(null);
    } catch (err) {
      return "file:///";
    }

    return mount.get_root().get_uri();
  }

  /**
   * Creates a directory.
   *
   * @param {string} uri
   * @param {(error: Error) => void} callback
   */
  mkdir(uri, callback) {
    const file = this.Gio.File.new_for_uri(uri);

    GioAsync(
      readyCallback => file.make_directory_async(
        PRIORITY_DEFAULT,
        null,
        readyCallback,
      ),

      result => file.make_directory_finish(result),

      callback,
    );
  }

  /**
   * Returns information about file.
   *
   * @param {GioFile} file
   * @param {(error?: Error, info?: FileInfo) => void} callback
   */
  queryInfo(file, callback) {
    GioAsync(
      readyCallback => file.query_info_async(
        this.fileAttributes,
        FileQueryInfoFlags.NONE,
        PRIORITY_DEFAULT,
        null,
        readyCallback,
      ),

      result => file.query_info_finish(result),

      callback,
    );
  }

  /**
   * Creates a file.
   *
   * @param {string} uri
   * @param {(error: Error) => void} callback
   */
  touch(uri, callback) {
    const file = this.Gio.File.new_for_uri(uri);

    GioAsync(
      readyCallback => file.create_async(
        FileCreateFlags.NONE,
        PRIORITY_DEFAULT,
        null,
        readyCallback,
      ),

      result => file.create_finish(result),

      callback,
    );
  }

  /**
   * Spawns a subprocess in a given working directory.
   *
   * @param {{ argv: string[], cwd?: string }} props
   */
  spawn(props) {
    const { argv, cwd } = props;
    const launcher = new this.Gio.SubprocessLauncher();

    if (cwd) {
      launcher.set_cwd(cwd);
    }

    launcher.set_flags(SubprocessFlags.NONE);
    return launcher.spawnv(argv);
  }

  /**
   * Runs a subprocess and returns its output.
   *
   * @param {string[]} argv
   * @param {(error?: Error, stdout?: string) => void} callback
   */
  communicate(argv, callback = noop) {
    const subprocess = new this.Gio.Subprocess({
      argv,
      flags: SubprocessFlags.STDOUT_PIPE,
    });

    subprocess.init(null);

    GioAsync(
      readyCallback => subprocess.communicate_utf8_async(
        null,
        null,
        readyCallback,
      ),

      result => subprocess.communicate_utf8_finish(result),

      (error, result) => {
        if (!result) {
          callback(error);
          return;
        }

        const stdout = /** @type {string} */ (result[1]);
        callback(undefined, stdout);
      },
    );
  }
}

exports.GioService = GioService;
