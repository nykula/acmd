/* global imports */
const find = require('lodash/find')
const Lang = imports.lang
const WorkerRunner = require('./WorkerRunner').default

/**
 * Let the front-end use drives.
 */
exports.default = new Lang.Class({
  Name: 'GioAdapter',

  /**
   * Bind methods to the instance and store a volume monitor reference.
   */
  _init: function ({ GLib, Gio, Gtk }) {
    this.GLib = GLib
    this.Gio = Gio
    this.Gtk = Gtk

    this._serializeDrive = Lang.bind(this, this._serializeDrive)
    this._serializeVolume = Lang.bind(this, this._serializeVolume)
    this._serializeMount = Lang.bind(this, this._serializeMount)

    this.drives = this.drives.bind(this)
    this.launch = this.launch.bind(this)
    this.ls = this.ls.bind(this)
    this.mkdir = this.mkdir.bind(this)
    this.mount = this.mount.bind(this)
    this.spawn = this.spawn.bind(this)
    this.unmount = this.unmount.bind(this)

    this.gVolMon = this.Gio.VolumeMonitor.get()
    this.work = new WorkerRunner()
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-this.Gtk-3.0/gjs/this.Gio.Drive.html
   */
  drives: function (props) {
    const handleSuccess = props.onSuccess

    const gDrives = this.gVolMon.get_connected_drives()
    const drives = gDrives.map(this._serializeDrive)
    const rootInfo = this.Gio.File.new_for_path('/').query_filesystem_info('*', null)
    const mounts = [{
      name: '/',
      icon: 'computer',
      iconType: 'ICON_NAME',
      rootUri: 'file:///',
      attributes: rootInfo.list_attributes(null)
        .reduce((prev, key) => {
          prev[key] = rootInfo.get_attribute_as_string(key)
          return prev
        }, {})
    }].concat(this.gVolMon.get_mounts().map(this._serializeMount))

    handleSuccess({
      drives: drives,
      mounts: mounts
    })
  },

  _serializeDrive: function (gDrive) {
    const drive = {
      hasMedia: gDrive.has_media(),
      identifiers: this._serializeIdentifiers(gDrive),
      volumes: gDrive.get_volumes().map(this._serializeVolume)
    }

    return drive
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-this.Gtk-3.0/gjs/this.Gio.Volume.html
   */
  mount: function (props) {
    const handleSuccess = props.onSuccess
    const identifier = props.identifier

    const gVolume = find(this.gVolMon.get_volumes(), _gVolume => {
      return _gVolume.get_identifier(identifier.type) === identifier.value
    })

    const mountOperation = new this.Gtk.MountOperation()

    gVolume.mount(this.Gio.MountMountFlags.NONE, mountOperation, null, () => {
      handleSuccess()
    })
  },

  _serializeVolume: function (gVolume) {
    const gMount = gVolume.get_mount()

    const volume = {
      mount: gMount ? this._serializeMount(gMount) : null,
      identifiers: this._serializeIdentifiers(gVolume)
    }

    return volume
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-this.Gtk-3.0/gjs/this.Gio.Mount.html
   */
  unmount: function (props) {
    const handleSuccess = props.onSuccess
    const uri = props.uri

    const gFile = this.Gio.File.new_for_uri(uri)
    const gMount = gFile.find_enclosing_mount(null)

    gMount.unmount(this.Gio.MountUnmountFlags.NONE, null, () => {
      handleSuccess()
    })
  },

  _serializeMount: function (gMount) {
    const root = gMount.get_root()
    const rootInfo = root.query_filesystem_info('*', null)

    const mount = {
      name: gMount.get_name(),
      icon: gMount.get_icon().to_string(),
      iconType: 'GICON',
      rootUri: root ? root.get_uri() : null,
      attributes: root ? rootInfo.list_attributes(null).reduce((prev, key) => {
        prev[key] = rootInfo.get_attribute_as_string(key)
        return prev
      }, {}) : {}
    }

    return mount
  },

  /**
   * Opens paths in an application.
   */
  launch: function (handler, paths) {
    const gAppInfo = this.Gio.AppInfo.create_from_commandline(
      handler.commandline,
      null,
      this.Gio.AppInfoCreateFlags.NONE
    )

    const gFiles = paths.map(x => this.Gio.File.new_for_path(x))
    gAppInfo.launch(gFiles, null)
  },

  /**
   * For every file in a given directory, lists its display name, name,
   * modification time and size. Also lists standard, access and ownership
   * attributes as strings.
   */
  ls: function (props) {
    const handleError = props.onError
    const handleSuccess = props.onSuccess
    const path = props.path

    const handleRequest = () => {
      const dir = this.Gio.file_new_for_path(path)
      dir.enumerate_children_async(
        'standard::*,access::*,owner::*,time::*,unix::*',
        this.Gio.FileQueryInfoFlags.NONE,
        this.GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            const enumerator = dir.enumerate_children_finish(result)
            handleChildren(enumerator)
          } catch (err) {
            handleError(err)
          }
        }
      )
    }

    const handleChildren = (enumerator) => {
      enumerator.next_files_async(
        this.GLib.MAXINT32,
        this.GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            const list = enumerator.next_files_finish(result)
            handleInfos(list)
          } catch (err) {
            handleError(err)
          }
        }
      )
    }

    const handleInfos = (list) => {
      const files = list.map(gFileInfo => {
        const attributes = []
          .concat(gFileInfo.list_attributes('access'))
          .concat(gFileInfo.list_attributes('owner'))
          .concat(gFileInfo.list_attributes('unix'))
          .reduce((prev, key) => {
            prev[key] = gFileInfo.get_attribute_as_string(key)
            return prev
          }, {})

        const contentType = gFileInfo.get_content_type()
        const gAppInfos = this.Gio.AppInfo.get_all_for_type(contentType)

        const def = this.Gio.AppInfo.get_default_for_type(contentType, false)
        if (def) {
          gAppInfos.unshift(def)
        }

        const handlers = gAppInfos
          .map(gAppInfo => {
            const icon = gAppInfo.get_icon()
            return {
              commandline: gAppInfo.get_commandline(),
              displayName: gAppInfo.get_display_name(),
              icon: icon ? icon.to_string() : null
            }
          })
          .filter((x, i, xs) => {
            for (let j = 0; j < i; j++) {
              if (xs[j].commandline === x.commandline) {
                return false
              }
            }
            return true
          })

        const file = {
          contentType: contentType,
          displayName: gFileInfo.get_display_name(),
          fileType: Object.keys(this.Gio.FileType)[gFileInfo.get_file_type()],
          icon: gFileInfo.get_icon().to_string(),
          iconType: 'GICON',
          name: gFileInfo.get_name(),
          modificationTime: gFileInfo.get_modification_time().tv_sec,
          size: gFileInfo.get_size(),
          attributes: attributes,
          handlers: handlers
        }

        return file
      })

      handleSuccess(files)
    }

    handleRequest()
  },

  /**
   * Creates a directory.
   */
  mkdir: function (props) {
    const handleError = props.onError
    const handleSuccess = props.onSuccess
    const path = props.path

    const dir = this.Gio.file_new_for_path(path)

    dir.make_directory_async(
      this.GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          handleSuccess()
        } catch (err) {
          handleError(err)
        }
      }
    )
  },

  /**
   * Spawns a subprocess in a given working directory.
   */
  spawn: function ({ argv, cwd }) {
    const launcher = new this.Gio.SubprocessLauncher()
    launcher.set_cwd(cwd)
    launcher.set_flags(this.Gio.SubprocessFlags.NONE)
    return launcher.spawnv(argv)
  },

  /**
   * Get a hash table of this.Gio.Drive or this.Gio.Volume identifiers. Known possible
   * keys for this.Gio.Volume: class, unix-device, uuid, label.
   */
  _serializeIdentifiers: function (gX) {
    return gX.enumerate_identifiers().reduce((identifiers, type) => {
      identifiers[type] = gX.get_identifier(type)
      return identifiers
    }, {})
  }
})
