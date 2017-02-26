/* global imports */
const Lang = imports.lang
const GioCancellableAdapter = require('./GioCancellable').default
const WorkerRunner = require('./WorkerRunner').default

/**
 * Let the front-end use drives.
 */
exports.default = new Lang.Class({
  Name: 'GioAdapter',

  /**
   * Bind methods to the instance and store a volume monitor reference.
   */
  _init: function ({GLib, Gio, Gtk, onResponse}) {
    this.GLib = GLib
    this.Gio = Gio
    this.Gtk = Gtk

    this._getDrives = Lang.bind(this, this._getDrives)
    this._serializeDrive = Lang.bind(this, this._serializeDrive)

    this._mount = Lang.bind(this, this._mount)
    this._cancelMount = Lang.bind(this, this._cancelMount)
    this._serializeVolume = Lang.bind(this, this._serializeVolume)

    this._unmount = Lang.bind(this, this._unmount)
    this._cancelUnmount = Lang.bind(this, this._cancelUnmount)
    this._serializeMount = Lang.bind(this, this._serializeMount)

    this.ls = this.ls.bind(this)
    this.cancelLs = this.cancelLs.bind(this)
    this.lsCancellables = new GioCancellableAdapter()

    this.gVolMon = this.Gio.VolumeMonitor.get()
    this.mountCancellables = new GioCancellableAdapter()
    this.unmountCancellables = new GioCancellableAdapter()
    this.work = new WorkerRunner()

    this.dispatch = onResponse
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-this.Gtk-3.0/gjs/this.Gio.Drive.html
   */
  _getDrives: function (requestId) {
    const gDrives = this.gVolMon.get_connected_drives()
    const drives = gDrives.map(this._serializeDrive)

    this.dispatch({
      type: 'DRIVES_REQUESTED',
      requestId: requestId,
      ready: true,
      result: {
        drives: drives
      }
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
  _mount: function (identifier, requestId) {
    const gVolume = this._find(_gVolume => {
      return _gVolume.get_identifier(identifier.type) === identifier.value
    }, this.gVolMon.get_volumes())

    const mountOperation = new this.Gtk.MountOperation()
    const cancellable = this.mountCancellables._create(requestId)

    gVolume.mount(this.Gio.MountMountFlags.NONE, mountOperation, cancellable, () => {
      this.dispatch({
        type: 'MOUNT_REQUESTED',
        requestId: requestId,
        ready: true
      })
    })

    this.dispatch({
      type: 'MOUNT_REQUESTED',
      requestId: requestId,
      cancellable: true
    })
  },

  _cancelMount: function (requestId) {
    this.mountCancellables._cancel(requestId, () => {
      this.dispatch({
        type: 'MOUNT_CANCEL_REQUESTED',
        requestId: requestId,
        ready: true
      })
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
  _unmount: function (identifier, requestId) {
    const gMount = this._find(_gMount => {
      const gVolume = _gMount.get_volume()
      return gVolume && gVolume.get_identifier(identifier.type) === identifier.value
    }, this.gVolMon.get_mounts())

    const cancellable = this.unmountCancellables._create(requestId)
    gMount.unmount(this.Gio.MountUnmountFlags.NONE, cancellable, () => {
      this.dispatch({
        type: 'UNMOUNT_REQUESTED',
        requestId: requestId,
        ready: true
      })
    })

    this.dispatch({
      type: 'UNMOUNT_REQUESTED',
      requestId: requestId,
      cancellable: true
    })
  },

  _cancelUnmount: function (requestId) {
    this.unmountCancellables._cancel(requestId, () => {
      this.dispatch({
        type: 'UNMOUNT_CANCEL_REQUESTED',
        requestId: requestId,
        ready: true
      })
    })
  },

  _serializeMount: function (gMount) {
    const root = gMount.get_root()

    const mount = {
      root: root ? {
        uri: root.get_uri()
      } : null
    }

    return mount
  },

  /**
   * For every file in a given directory, lists its display name, name,
   * modification time and size. Also lists standard, access and ownership
   * attributes as strings.
   */
  ls: function (action) {
    const path = action.path
    const requestId = action.requestId
    const panel = action.panel

    const dir = this.Gio.file_new_for_path(path)
    const cancellable = this.lsCancellables._create(requestId)

    const handleError = (err) => {
      this.dispatch({
        type: 'LS',
        panel: panel,
        path: path,
        requestId: requestId,
        ready: true,
        error: { message: err.message }
      })
    }

    const handleChildren = (enumerator) => {
      enumerator.next_files_async(
        this.GLib.MAXINT32,
        this.GLib.PRIORITY_DEFAULT,
        cancellable,
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
          .reduce((prev, key) => {
            prev[key] = gFileInfo.get_attribute_as_string(key)
            return prev
          }, {})

        const file = {
          displayName: gFileInfo.get_display_name(),
          fileType: Object.keys(this.Gio.FileType)[gFileInfo.get_file_type()],
          name: gFileInfo.get_name(),
          modificationTime: gFileInfo.get_modification_time().tv_sec,
          size: gFileInfo.get_size(),
          attributes: attributes
        }

        return file
      })

      this.dispatch({
        type: 'LS',
        panel: panel,
        path: path,
        requestId: requestId,
        ready: true,
        result: { files: files }
      })
    }

    dir.enumerate_children_async(
      'standard::*,access::*,owner::*,time::*',
      this.Gio.FileQueryInfoFlags.NONE,
      this.GLib.PRIORITY_DEFAULT,
      cancellable,
      (_, result) => {
        try {
          const enumerator = dir.enumerate_children_finish(result)
          handleChildren(enumerator)
        } catch (err) {
          handleError(err)
        }
      }
    )
  },

  /**
   * Cancels a list operation in progress.
   */
  cancelLs: function (action) {
    const requestId = action.requestId

    this.lsCancellables._cancel(requestId, () => {
      this.dispatch({
        type: 'LS_CANCEL',
        requestId: requestId,
        ready: true
      })
    })
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
  },

  _find: function (predicate, xs) {
    for (let i = 0; i < xs.length; i++) {
      if (predicate(xs[i])) {
        return xs[i]
      }
    }

    return null
  }
})
