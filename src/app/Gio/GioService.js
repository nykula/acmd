const { FileQueryInfoFlags, SubprocessFlags } = imports.gi.Gio;
const GLib = imports.gi.GLib;
const { map, waterfall } = require("async");
const find = require("lodash/find");
const uniqBy = require("lodash/uniqBy");
const Uri = require("url-parse");
const { File } = require("../../domain/File/File");
const { FileHandler } = require("../../domain/File/FileHandler");
const { Place } = require("../../domain/Place/Place");
const autoBind = require("../Gjs/autoBind").default;
const gioAsync = require("./gioAsync").default;

/**
 * Let the front-end use drives.
 *
 * @param {any} Gio
 * @param {any} Gtk
 */
function GioService(Gio, Gtk) {
  autoBind(this, GioService.prototype, __filename);

  this.fileAttributes = "standard::*,time::*,unix::*";
  this.Gio = Gio;
  this.Gtk = Gtk;
  this.placeAttributes = "filesystem::*";
}

/**
 * Native volume monitor.
 * @type {{ get_connected_drives: () => any[], get_mounts: () => any[], get_volumes: () => any[] }}
 */
GioService.prototype.gVolMon = undefined;

GioService.prototype.ensureGVolMon = function() {
  if (!this.gVolMon) {
    this.gVolMon = this.Gio.VolumeMonitor.get();
  }
};

/**
 * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Drive.html
 * @param {(error: null, places: Place[]) => void} callback
 */
GioService.prototype.getPlaces = function(callback) {
  this.ensureGVolMon();

  /** @type {Place[]} */
  let places = [];

  const fromDrives = (_callback) => {
    /** @type {any[]} */
    const gVolumes = [];

    for (const gDrive of this.gVolMon.get_connected_drives()) {
      for (const gVolume of gDrive.get_volumes()) {
        gVolumes.push(gVolume);
      }
    }

    map(gVolumes, (gVolume, __callback) => {
      const label = gVolume.get_identifier("label");
      const uuid = gVolume.get_identifier("uuid");
      const gMount = gVolume.get_mount();

      if (gMount) {
        this._serializeMount(gMount, __callback);
      } else {
        __callback(null, {
          filesystemFree: 0,
          filesystemSize: 0,
          icon: "drive-harddisk",
          iconType: "ICON_NAME",
          name: label || uuid,
          rootUri: null,
          uuid,
        });
      }
    }, (_, _places) => {
      places = places.concat(_places);
      _callback();
    });
  };

  const fromMounts = (_callback) => {
    map(this.gVolMon.get_mounts(), this._serializeMount, (_, _places) => {
      places = places.concat(_places);
      places = uniqBy(places, mount => mount.uuid || mount.name);
      _callback();
    });
  };

  const fromFilesystem = (_callback) => {
    gioAsync(this.Gio.File.new_for_uri("file:///"), "query_filesystem_info",
      this.placeAttributes,
      GLib.PRIORITY_DEFAULT,
      null,
      (_, rootInfo) => {
        places.unshift({
          filesystemFree: Number(rootInfo.get_attribute_as_string("filesystem::free")),
          filesystemSize: Number(rootInfo.get_attribute_as_string("filesystem::size")),
          icon: "computer",
          iconType: "ICON_NAME",
          name: "/",
          rootUri: "file:///",
          uuid: null,
        });

        _callback(null, places);
      },
    );
  };

  waterfall([
    fromDrives,
    fromMounts,
    fromFilesystem,
  ], callback);
};

/**
 * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Volume.html
 */
GioService.prototype.mount = function(props, callback) {
  let mountOperation;

  if (props.identifier) {
    const identifier = props.identifier;

    this.ensureGVolMon();

    const gVolume = find(this.gVolMon.get_volumes(), _gVolume => {
      return _gVolume.get_identifier(identifier.type) === identifier.value;
    });

    mountOperation = new this.Gtk.MountOperation();

    gVolume.mount(this.Gio.MountMountFlags.NONE, mountOperation, null, () => {
      callback();
    });
  } else {
    const uri = Uri(props.uri);
    const { auth, username, password, host } = uri;

    if (!uri.pathname) {
      uri.set("pathname", "/");
    }

    let mountOperation;

    if ((username && password) || auth === username + ":") {
      mountOperation = new this.Gio.MountOperation();
      mountOperation.connect("ask-password", () => {
        mountOperation.set_domain(host);
        mountOperation.set_username(username);
        mountOperation.set_password(password);
        mountOperation.reply(this.Gio.MountOperationResult.HANDLED);
      });
    } else {
      mountOperation = new this.Gtk.MountOperation();
    }

    uri.set("password", "");
    const gFile = this.Gio.File.new_for_uri(uri.toString());
    gFile.mount_enclosing_volume(this.Gio.MountMountFlags.NONE, mountOperation, null, (_, result) => {
      try {
        gFile.mount_enclosing_volume_finish(result);
      } catch (error) {
        callback(error);
        return;
      }
      callback(null, uri.toString());
    });
  }
};

/**
 * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Mount.html
 */
GioService.prototype.unmount = function(uri, callback) {
  const gFile = this.Gio.File.new_for_uri(uri);
  const gMount = gFile.find_enclosing_mount(null);

  gMount.unmount(this.Gio.MountUnmountFlags.NONE, null, () => {
    callback();
  });
};

/**
 * @param {any} gMount
 * @param {(error: Error, place: Place) => void} callback
 */
GioService.prototype._serializeMount = function(gMount, callback) {
  const root = gMount.get_root();

  gioAsync(root, "query_filesystem_info",
    this.placeAttributes,
    GLib.PRIORITY_DEFAULT,
    null,
    (_, rootInfo) => {
      /** @type {Place} */
      const place = {
        filesystemFree: Number(rootInfo.get_attribute_as_string("filesystem::free")),
        filesystemSize: Number(rootInfo.get_attribute_as_string("filesystem::size")),
        icon: gMount.get_icon().to_string(),
        iconType: "GICON",
        name: gMount.get_name(),
        rootUri: root.get_uri(),
        uuid: null,
      };

      callback(null, place);
    });
};

/**
 * Opens URIs in an application.
 */
GioService.prototype.launch = function(handler, uris) {
  const gAppInfo = this.Gio.AppInfo.create_from_commandline(
    handler.commandline,
    null,
    this.Gio.AppInfoCreateFlags.NONE,
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
  let files = [];
  const dir = this.Gio.file_new_for_uri(uri);
  const parent = dir.get_parent();

  const handleRequest = callback => {
    gioAsync(dir, "query_info",
      this.fileAttributes,
      this.Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      callback,
    );
  };

  const handleSelf = (selfInfo, callback) => {
    const selfFile = mapGFileInfoToFile(selfInfo);
    selfFile.displayName = ".";
    selfFile.mountUri = this.getMountUri(dir);
    selfFile.name = ".";
    selfFile.uri = dir.get_uri();
    files = [selfFile];

    if (!parent) {
      callback(null, null);
      return;
    }

    gioAsync(parent, "query_info",
      this.fileAttributes,
      this.Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      callback,
    );
  };

  const handleParent = (parentInfo, callback) => {
    if (parentInfo) {
      const parentFile = mapGFileInfoToFile(parentInfo);
      parentFile.displayName = "..";
      parentFile.name = "..";
      parentFile.icon = "go-up";
      parentFile.iconType = "ICON_NAME";
      parentFile.uri = parent.get_uri();
      files = files.concat(parentFile);
    }

    gioAsync(dir, "enumerate_children",
      this.fileAttributes,
      this.Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      callback,
    );
  };

  const handleChildren = (enumerator, callback) => {
    gioAsync(enumerator, "next_files",
      GLib.MAXINT32,
      GLib.PRIORITY_DEFAULT,
      null,
      callback,
    );
  };

  const handleInfos = (list, callback) => {
    files = files.concat(list.map(mapGFileInfoToFile));
    callback(null, files);
  };

  const mapGFileInfoToFile = gFileInfo => {
    const mode = gFileInfo.get_attribute_as_string("unix::mode");
    const name = gFileInfo.get_name();

    /** @type {File} */
    const file = {
      displayName: gFileInfo.get_display_name(),
      fileType: gFileInfo.get_file_type(),
      icon: gFileInfo.get_icon().to_string(),
      iconType: "GICON",
      name: name,
      mode: Number(mode).toString(8).slice(-4),
      modificationTime: gFileInfo.get_modification_time().tv_sec,
      mountUri: "",
      size: gFileInfo.get_size(),
      uri: dir.get_child(name).get_uri(),
    };

    return file;
  };

  waterfall([
    handleRequest,
    handleSelf,
    handleParent,
    handleChildren,
    handleInfos,
  ], callback);
};

/**
 * Gets content type of a given file, and apps that can open it.
 *
 * @param {string} url
 * @param {(error: Error, result: { contentType: string, handlers: FileHandler[] }) => void} callback
 */
GioService.prototype.getHandlers = function(uri, callback) {
  const file = this.Gio.file_new_for_uri(uri);

  gioAsync(file, "query_info",
    this.fileAttributes,
    FileQueryInfoFlags.NONE,
    GLib.PRIORITY_DEFAULT,
    null,
    (error, gFileInfo) => {
      if (error) {
        callback(error);
        return;
      }

      const contentType = gFileInfo.get_content_type();

      /** @type {any[]} */
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
 */
GioService.prototype.mkdir = function(uri, callback) {
  gioAsync(this.Gio.file_new_for_uri(uri), "make_directory",
    GLib.PRIORITY_DEFAULT,
    null,
    callback,
  );
};

/**
 * Creates a file.
 */
GioService.prototype.touch = function(uri, callback) {
  gioAsync(this.Gio.File.new_for_uri(uri), "create",
    this.Gio.FileCreateFlags.NONE,
    GLib.PRIORITY_DEFAULT,
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
GioService.prototype.communicate = function(argv, callback) {
  const subprocess = new this.Gio.Subprocess({
    argv,
    flags: SubprocessFlags.STDOUT_PIPE,
  });

  subprocess.init(null);

  gioAsync(subprocess, "communicate_utf8", null, null, (_, result) => {
    const stdout = result[1];
    callback(null, stdout);
  });
};

exports.GioService = GioService;
