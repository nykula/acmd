#!/usr/bin/gjs

/* global imports, ARGV */

const Gtk = imports.gi.Gtk
const Lang = imports.lang
const Webkit = imports.gi.WebKit2

const URI = ARGV[0]

const Browser = new Lang.Class({
  Name: 'Browser',

  _init: function () {
    this.application = new Gtk.Application()

    this.application.connect('activate', Lang.bind(this, this._onActivate))
    this.application.connect('startup', Lang.bind(this, this._onStartup))
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

    this._webView.connect('submit-form', (x, y, z) => {
      const script = 'console.log(' + JSON.stringify([ x, y, z ]) + ');'
      this._webView.run_javascript(script, null, null, null)
    })

    this._webView.connect('notify::title', (x, y, z) => {
      const title = this._webView.get_title()
      this._window.set_title(title)
    })

    this._window.add(this._webView)
    this._window.show_all()
  }
})

let browser = new Browser()
browser.application.run(ARGV)
