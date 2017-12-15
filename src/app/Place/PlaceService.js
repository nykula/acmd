const {
  File,
  FileInfo,
  FileQueryInfoFlags,
  Mount,
  MountMountFlags,
  MountOperation,
  MountOperationResult,
  MountUnmountFlags,
  Volume,
  VolumeMonitor,
} = imports.gi.Gio;
const GLib = imports.gi.GLib;
const { PRIORITY_DEFAULT } = GLib;
const { map, series } = require("async");
const uniqBy = require("lodash/uniqBy");
const { action, computed, extendObservable } = require("mobx");
const Uri = require("url-parse");
const { Place } = require("../../domain/Place/Place");
const { GioAsync } = require("../Gio/GioAsync");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { RefService } = require("../Ref/RefService");

/**
 * Mounts drives and remote locations.
 */
class PlaceService {
  /**
   * Shortens the string as much as possible without making it confusing.
   *
   * @param {string[]} xs
   * @param {string} x
   */
  static minLength(xs, x) {
    for (let i = 1; i < x.length; i++) {
      const short = x.slice(0, i);
      const same = xs.filter(other => other.slice(0, i) === short).length;

      if (same === 1) {
        return short;
      }
    }

    return x;
  }

  /**
   * @param {{ refService: RefService }} props
   */
  constructor(props) {
    /** @type {{ [name: string]: Place }} */
    this.entities = {
      "/": {
        filesystemFree: 0,
        filesystemSize: 0,
        icon: "computer",
        iconType: "ICON_NAME",
        name: "/",
        rootUri: "file:///",
        uuid: null,
      },
    };

    this.File = File;

    this.GLib = GLib;

    this.MountOperation = MountOperation;

    this.names = ["/"];

    this.placeAttributes = "filesystem::*";

    this.props = props;

    /** @type {{ [name: string]: string }} */
    this.shortNames = {};

    this.VolumeMonitor = VolumeMonitor;

    autoBind(this, PlaceService.prototype, __filename);

    extendObservable(this, {
      entities: this.entities,
      names: this.names,
      set: action(this.set),
      shortNames: computed(this.getShortNames),
    });
  }

  /**
   * Opens a keyboard-friendly places list.
   *
   * @param {number} panelId
   */
  list(panelId) {
    const { refService } = this.props;
    refService.get("mounts" + panelId).popup();
  }

  /**
   * Mounts a remote place, such as SFTP.
   *
   * @param {string} uriStr
   * @param {(error: Error | undefined, uri: string) => void} callback
   */
  mount(uriStr, callback) {
    const uri = Uri(uriStr);
    const { auth, username, password, host } = uri;

    if (!uri.pathname) {
      uri.set("pathname", "/");
    }

    const mountOperation = new this.MountOperation();

    if ((username && password) || auth === username + ":") {
      mountOperation.connect("ask-password", () => {
        mountOperation.set_domain(host);
        mountOperation.set_username(username);
        mountOperation.set_password(password);
        mountOperation.reply(MountOperationResult.HANDLED);
      });
    }

    uri.set("password", "");
    const gFile = this.File.new_for_uri(uri.toString());
    gFile.mount_enclosing_volume(
      MountMountFlags.NONE,
      mountOperation,
      null,
      (_, result) => {
        try {
          gFile.mount_enclosing_volume_finish(result);
        } catch (error) {
          callback(error);
          return;
        }
        callback(undefined, uri.toString());
      },
    );
  }

  /**
   * Mounts a local volume.
   *
   * @param {string} uuid
   * @param {() => void} callback
   */
  mountUuid(uuid, callback) {
    const gVolMon = this.VolumeMonitor.get();

    for (const gVolume of gVolMon.get_volumes()) {
      if (gVolume.get_identifier("uuid") !== uuid) {
        continue;
      }

      const mountOperation = new this.MountOperation();

      gVolume.mount(MountMountFlags.NONE, mountOperation, null, () => {
        callback();
      });

      break;
    }
  }

  /**
   * Gets a places list from system.
   */
  refresh() {
    /** @type {Place[]} */
    let places = [];

    series(
      [
        callback =>
          this.getSpecials((error, specials) => {
            places = places.concat(specials);
            callback(error);
          }),

        callback =>
          this.getDrives((error, drives) => {
            places = places.concat(drives);
            callback(error);
          }),

        callback =>
          this.getMounts((error, mounts) => {
            places = places.concat(mounts);
            places = uniqBy(places, place => place.uuid || place.name);
            callback(error);
          }),

        callback =>
          this.getFilesystem((error, fs) => {
            places.unshift(fs);
            callback(error);
          }),
      ],
      _ => this.set(places),
    );
  }

  /**
   * Stores given places.
   *
   * @param {Place[]} places
   */
  set(places) {
    this.names = places.map(x => x.name).sort();

    for (const place of places) {
      this.entities[place.name] = place;
    }
  }

  /**
   * Unmounts a place.
   *
   * @param {string} uri
   * @param {() => void} callback
   */
  unmount(uri, callback) {
    const gFile = this.File.new_for_uri(uri);
    const gMount = gFile.find_enclosing_mount(null);

    gMount.unmount(MountUnmountFlags.NONE, null, () => {
      callback();
    });
  }

  /**
   * @private
   * @param {(error: Error | undefined, places: Place[]) => void} callback
   */
  getDrives(callback) {
    const gVolMon = this.VolumeMonitor.get();

    /** @type {Volume[]} */
    const gVolumes = [];

    for (const gDrive of gVolMon.get_connected_drives()) {
      for (const gVolume of gDrive.get_volumes()) {
        gVolumes.push(gVolume);
      }
    }

    map(
      gVolumes,
      (gVolume, volumeCallback) => {
        const label = gVolume.get_identifier("label");
        const uuid = gVolume.get_identifier("uuid");
        const gMount = gVolume.get_mount();

        if (gMount) {
          this.serializeMount(gMount, volumeCallback);
        } else {
          volumeCallback(undefined, {
            filesystemFree: 0,
            filesystemSize: 0,
            icon: "drive-harddisk",
            iconType: "ICON_NAME",
            name: label || uuid,
            rootUri: null,
            uuid,
          });
        }
      },
      /** @type {any} */ (callback),
    );
  }

  /**
   * @private
   * @param {(error: Error | undefined, place: Place) => void} callback
   */
  getFilesystem(callback) {
    GioAsync(
      this.File.new_for_uri("file:///"),
      "query_filesystem_info",
      this.placeAttributes,
      PRIORITY_DEFAULT,
      null,
      (/** @type {Error} */ error, /** @type {FileInfo} */ rootInfo) => {
        callback(error, {
          filesystemFree: Number(
            rootInfo.get_attribute_as_string("filesystem::free"),
          ),
          filesystemSize: Number(
            rootInfo.get_attribute_as_string("filesystem::size"),
          ),
          icon: "computer",
          iconType: "ICON_NAME",
          name: "/",
          rootUri: "file:///",
          uuid: null,
        });
      },
    );
  }

  /**
   * @private
   * @param {(error: Error | undefined, places: Place[]) => void} callback
   */
  getMounts(callback) {
    const gVolMon = this.VolumeMonitor.get();
    const mounts = gVolMon.get_mounts();

    map(mounts, this.serializeMount, /** @type {any} */ (callback));
  }

  /**
   * @private
   */
  getShortNames() {
    const places = this.names.map(x => this.entities[x]);

    /** @type {{ [name: string]: string }} */
    const shortNames = {};

    for (const { name, icon } of places) {
      const sameIcon = places
        .filter(x => x.icon === icon)
        .map(x => x.name);

      shortNames[name] = PlaceService.minLength(sameIcon, name);
    }

    return shortNames;
  }

  /**
   * @private
   * @param {(error: Error | undefined, places: Place[]) => void} callback
   */
  getSpecials(callback) {
    let paths = [this.GLib.get_home_dir()];

    paths = paths.filter(Boolean);
    map(paths, this.serializeSpecial, /** @type {any} */ (callback));
  }

  /**
   * @private
   * @param {Mount} gMount
   * @param {(error: Error, place: Place) => void} callback
   */
  serializeMount(gMount, callback) {
    const root = gMount.get_root();

    GioAsync(
      root,
      "query_filesystem_info",
      this.placeAttributes,
      PRIORITY_DEFAULT,
      null,
      (/** @type {Error} */ error, /** @type {FileInfo} */ rootInfo) => {
        /** @type {Place} */
        const place = {
          filesystemFree: Number(
            rootInfo.get_attribute_as_string("filesystem::free"),
          ),
          filesystemSize: Number(
            rootInfo.get_attribute_as_string("filesystem::size"),
          ),
          icon: gMount.get_icon().to_string(),
          iconType: "GICON",
          name: gMount.get_name(),
          rootUri: root.get_uri(),
          uuid: null,
        };

        callback(error, place);
      },
    );
  }

  /**
   * @private
   * @param {string} path
   * @param {(error: Error, place: Place) => void} callback
   */
  serializeSpecial(path, callback) {
    const file = this.File.new_for_path(path);

    file.query_info_async(
      "standard::*",
      FileQueryInfoFlags.NONE,
      PRIORITY_DEFAULT,
      null,
      GioAsync.ReadyCallback(
        result => file.query_info_finish(result),
        (error, /** @type {FileInfo} */ info) => {
          callback(error, {
            filesystemFree: 0,
            filesystemSize: 0,
            icon: GioIcon.stringify(info.get_icon()) || "folder",
            iconType: "GICON",
            name: info.get_name(),
            rootUri: file.get_uri(),
            uuid: null,
          });
        },
      ),
    );
  }
}

exports.PlaceService = PlaceService;
