#!/usr/bin/gjs

/* global imports, ARGV */

const Gio = imports.gi.Gio
const Gtk = imports.gi.Gtk
const Lang = imports.lang
const Webkit = imports.gi.WebKit2

const URI = ARGV[0]

const Browser = (this || exports).Browser = new Lang.Class({
  Name: 'Browser',

  _init: function () {
    this._dispatch = Lang.bind(this, this._dispatch)
    this._handleTitle = Lang.bind(this, this._handleTitle)

    this.application = new Gtk.Application()

    this.application.connect('activate', Lang.bind(this, this._onActivate))
    this.application.connect('startup', Lang.bind(this, this._onStartup))

    this.gioAdapter = new GioAdapter(this._dispatch)
  },

  _onActivate: function () {
    this._window.present()
  },

  _onStartup: function () {
    this._buildUI()
  },

  _buildUI: function () {
    this._window = new Gtk.ApplicationWindow({
      application: this.application,
      default_width: 800,
      default_height: 600,
      window_position: Gtk.WindowPosition.CENTER
    })

    this._webView = new Webkit.WebView()

    const settings = this._webView.get_settings()
    settings.allow_universal_access_from_file_urls = true
    settings.enable_developer_extras = true

    this._webView.load_uri(URI)
    this._webView.connect('notify::title', this._handleTitle)

    this._window.add(this._webView)
    this._window.show_all()
  },

  /**
   * Set window title to content of <title /> on page load. Use title changes as
   * a means to receive queries. Respond by dispatching Redux actions. Please
   * make a pull request if you know a better way to let WebView talk back.
   */
  _handleTitle: function () {
    const titleStr = this._webView.get_title()

    // Content of <title /> on page load
    if (titleStr[0] !== '{') {
      this._window.set_title(titleStr)
      return
    }

    // Value of document.title set by front-end scripts
    const action = JSON.parse(titleStr)

    switch (action.type) {
      case 'DRIVES_REQUESTED':
        this.gioAdapter._getDrives(action.requestId)
        return

      case 'MOUNT_REQUESTED':
        this.gioAdapter._mount(action.identifier, action.requestId)
        return

      case 'MOUNT_CANCEL_REQUESTED':
        this.gioAdapter._cancelMount(action.requestId)
        return

      case 'UNMOUNT_REQUESTED':
        this.gioAdapter._unmount(action.identifier, action.requestId)
        return

      case 'UNMOUNT_CANCEL_REQUESTED':
        this.gioAdapter._cancelUnmount(action.requestId)
        return

      default:
        return
    }
  },

  /**
   * Dispatch a Redux action on the front-end.
   */
  _dispatch: function (action) {
    // Just log for now
    const script = 'console.log(' + JSON.stringify(action) + ');'
    this._webView.run_javascript(script, null, null, null)
  }
})

/**
 * Let the front-end use drives.
 */
const GioAdapter = new Lang.Class({
  Name: 'GioAdapter',

  /**
   * Bind methods to the instance and store a volume monitor reference.
   */
  _init: function (dispatch) {
    this._getDrives = Lang.bind(this, this._getDrives)
    this._serializeDrive = Lang.bind(this, this._serializeDrive)

    this._mount = Lang.bind(this, this._mount)
    this._cancelMount = Lang.bind(this, this._cancelMount)
    this._serializeVolume = Lang.bind(this, this._serializeVolume)

    this._unmount = Lang.bind(this, this._unmount)
    this._cancelUnmount = Lang.bind(this, this._cancelUnmount)
    this._serializeMount = Lang.bind(this, this._serializeMount)

    this.gVolMon = Gio.VolumeMonitor.get()
    this.mountCancellables = new GioCancellableAdapter()
    this.unmountCancellables = new GioCancellableAdapter()

    this.dispatch = dispatch
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Drive.html
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
   * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Volume.html
   */
  _mount: function (identifier, requestId) {
    const gVolume = this._find(_gVolume => {
      return _gVolume.get_identifier(identifier.type) === identifier.value
    }, this.gVolMon.get_volumes())

    const mountOperation = new Gtk.MountOperation()
    const cancellable = this.mountCancellables._create(requestId)

    gVolume.mount(Gio.MountMountFlags.NONE, mountOperation, cancellable, () => {
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
   * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Mount.html
   */
  _unmount: function (identifier, requestId) {
    const gMount = this._find(_gMount => {
      const gVolume = _gMount.get_volume()
      return gVolume && gVolume.get_identifier(identifier.type) === identifier.value
    }, this.gVolMon.get_mounts())

    const cancellable = this.unmountCancellables._create(requestId)
    gMount.unmount(Gio.MountUnmountFlags.NONE, cancellable, () => {
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
   * Get a hash table of Gio.Drive or Gio.Volume identifiers. Known possible
   * keys for Gio.Volume: class, unix-device, uuid, label.
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

/**
 * Let the user make a request and then another one to cancel it.
 */
const GioCancellableAdapter = new Lang.Class({
  Name: 'GioCancellableAdapter',

  _init: function () {
    this._cancel = Lang.bind(this, this._cancel)
    this._create = Lang.bind(this, this._create)

    this.cancellables = {
      requestIds: [],
      entities: {}
    }
  },

  _create: function (requestId) {
    const cancellable = new Gio.Cancellable()

    this.cancellables.entities[requestId] = cancellable
    this.cancellables.requestIds.push(requestId)

    return cancellable
  },

  _cancel: function (requestId, callback) {
    const cancellable = this.cancellables.entities[requestId]
    cancellable.connect(callback)
    cancellable.cancel()

    this.cancellables.requestIds = this.cancellables.requestIds.filter(x => x !== requestId)
    delete this.cancellables.entities[requestId]
  }
})

let browser = new Browser()
browser.application.run(ARGV)
