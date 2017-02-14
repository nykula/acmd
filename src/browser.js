#!/usr/bin/gjs

/* global imports, ARGV */

const Gtk = imports.gi.Gtk
const Lang = imports.lang
const Webkit = imports.gi.WebKit2

const URI = ARGV[0]

const Browser = new Lang.Class({
  Name: 'Browser',

  _init: function () {
    this._handleTitle = Lang.bind(this, this._handleTitle)

    this.application = new Gtk.Application()

    this.application.connect('activate', Lang.bind(this, this._onActivate))
    this.application.connect('startup', Lang.bind(this, this._onStartup))

    this.gioAdapter = new GioAdapter(imports.gi.Gio)
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
   * Set window title to content of <title /> on page load. Use the value of
   * document.title set by front-end scripts as a fetch-like notation of a
   * request. Please make a pull request if you know a better way to let
   * WebView talk back.
   */
  _handleTitle: function () {
    const titleStr = this._webView.get_title()

    // Content of <title /> on page load
    if (titleStr[0] !== '[') {
      this._window.set_title(titleStr)
      return
    }

    // Value of document.title set by front-end scripts
    const req = JSON.parse(titleStr) // Array
    const url = req[0]
    const payload = req[1] || {}
    const method = payload.method || 'GET'
    const uuid = payload.uuid // To know which response is to which request

    if (url === '/drives' && method === 'GET') {
      const drives = this.gioAdapter._getDrives()

      // Just log for now
      const script = 'console.log(' + JSON.stringify({
        uuid: uuid,
        drives: drives
      }) + ');'

      this._webView.run_javascript(script, null, null, null)
    }
  }
})

/**
 * Let the front-end know about drives.
 */
const GioAdapter = new Lang.Class({
  Name: 'GioAdapter',

  /**
   * Bind methods to the instance and store a volume monitor reference.
   */
  _init: function (Gio) {
    this._getDrives = Lang.bind(this, this._getDrives)
    this._serializeDrive = Lang.bind(this, this._serializeDrive)
    this._serializeVolume = Lang.bind(this, this._serializeVolume)
    this._serializeMount = Lang.bind(this, this._serializeMount)

    this.gVolMon = Gio.VolumeMonitor.get()
  },

  /**
   * GET /drives would be the endpoint.
   */
  _getDrives: function () {
    const gDrives = this.gVolMon.get_connected_drives()
    return gDrives.map(this._serializeDrive)
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Drive.html
   */
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
  _serializeVolume: function (gVolume) {
    const gMount = gVolume.get_mount()

    const volume = {
      mount: gMount ? this._serializeMount(gMount) : null,
      identifiers: this._serializeIdentifiers(gVolume)
    }

    // const mountOperation = new Gtk.MountOperation()
    // const cancellable = new Gio.Cancellable()
    // gVolume.mount(Gio.MountMountFlags.NONE, mountOperation, cancellable, null)

    return volume
  },

  /**
   * @see https://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/Gio.Mount.html
   */
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
  }
})

let browser = new Browser(imports.gi.Gio)
browser.application.run(ARGV)
