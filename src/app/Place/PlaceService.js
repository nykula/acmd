const {
  File,
  FileInfo,
  Mount,
  MountMountFlags,
  MountOperation,
  MountOperationResult,
  MountUnmountFlags,
  Volume,
  VolumeMonitor,
} = imports.gi.Gio;
const { PRIORITY_DEFAULT } = imports.gi.GLib;
const { map, series } = require("async");
const uniqBy = require("lodash/uniqBy");
const { action, extendObservable } = require("mobx");
const Uri = require("url-parse");
const { Place } = require("../../domain/Place/Place");
const { gioAsync } = require("../Gio/gioAsync");
const { autoBind } = require("../Gjs/autoBind");
const { RefService } = require("../Ref/RefService");

/**
 * Mounts drives and remote locations.
 */
class PlaceService {
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

    this.MountOperation = MountOperation;

    this.names = ["/"];

    this.placeAttributes = "filesystem::*";

    this.props = props;

    this.VolumeMonitor = VolumeMonitor;

    autoBind(this, PlaceService.prototype, __filename);

    extendObservable(this, {
      entities: this.entities,
      names: this.names,
      set: action(this.set),
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
   * @param {string} _uri
   * @param {(error: Error, uri: string) => void} callback
   */
  mount(_uri, callback) {
    const uri = Uri(_uri);
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
        callback(null, uri.toString());
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
      (gVolume, _callback) => {
        const label = gVolume.get_identifier("label");
        const uuid = gVolume.get_identifier("uuid");
        const gMount = gVolume.get_mount();

        if (gMount) {
          this.serializeMount(gMount, _callback);
        } else {
          _callback(null, {
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
      callback,
    );
  }

  /**
   * @private
   * @param {(error: Error | undefined, place: Place) => void} callback
   */
  getFilesystem(callback) {
    gioAsync(
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
    map(gVolMon.get_mounts(), this.serializeMount, callback);
  }

  /**
   * @private
   * @param {Mount} gMount
   * @param {(error: Error, place: Place) => void} callback
   */
  serializeMount(gMount, callback) {
    const root = gMount.get_root();

    gioAsync(
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
}

exports.PlaceService = PlaceService;
