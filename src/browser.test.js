/* eslint-env jest */

it('can be instantiated', () => {
  setup()
})

it('provides info about drives', () => {
  const { browser, imports } = setup()

  const gVolMon = imports.gi.Gio.VolumeMonitor.get()
  gVolMon.get_connected_drives = () => [{
    has_media: () => true,
    enumerate_identifiers: () => [
      'class',
      'unix-device',
      'uuid',
      'label'
    ],
    get_identifier: (x) => {
      switch (x) {
        case 'class':
          return 'device'

        case 'unix-device':
          return '/dev/sda'

        case 'uuid':
          return 'abc'

        case 'label':
          return 'System'
      }
    },
    get_volumes: () => [{
      enumerate_identifiers: () => ['uuid'],
      get_identifier: () => null,
      get_mount: () => ({
        get_root: () => ({
          get_uri: () => '/media/System'
        })
      })
    }]
  }]

  imports._title = JSON.stringify({
    type: 'DRIVES_REQUESTED',
    requestId: 1
  })

  browser._handleTitle()

  expect(imports._dispatched.slice(-1)[0]).toMatchObject({
    type: 'DRIVES_REQUESTED',
    requestId: 1,
    ready: true,
    result: {
      drives: [{
        hasMedia: true,
        identifiers: {
          class: 'device',
          'unix-device': '/dev/sda',
          uuid: 'abc',
          label: 'System'
        },
        volumes: [{
          mount: {
            root: { uri: '/media/System' }
          },
          identifiers: { uuid: null }
        }]
      }]
    }
  })
})

/**
 * Mock the GNOME JavaScript environment.
 */
function setup () {
  global.ARGV = ['http://localhost:3000']

  const imports = global.imports = {
    gi: {},

    // Just for the mock. Not present in the environment.
    _dispatched: [],
    _title: ''
  }

  const gVolMon = {
    get_connected_drives: () => []
  }

  imports.gi.Gio = {
    VolumeMonitor: {
      get: () => gVolMon
    }
  }

  const Lang = imports.lang = {
    bind: function (ctx, x) {
      return x.bind(ctx)
    },

    /**
     * Make a class out of an object literal, using its _init property
     * as the constructor. GJS doesn't have ES6 classes.
     *
     * @see https://wiki.gnome.org/Projects/Gjs/StyleGuide#Classes
     */
    Class: function (x) {
      const X = x._init
      X.prototype = x
      return X
    }
  }

  imports.gi.Gtk = {
    Application: Lang.Class({
      Name: 'Application',
      _init: function () {
        // Just for the mock. Not present in the environment.
        this._connections = []
      },
      connect (signal, fun) {
        this._connections[signal] = fun
      },
      run () {
        this._connections.startup()
        this._connections.activate()
      }
    }),

    ApplicationWindow: Lang.Class({
      Name: 'ApplicationWindow',
      _init: function () { },
      present () { },
      add () { },
      show_all () { },
      set_title () { }
    }),

    WindowPosition: {
      CENTER: null
    }
  }

  imports.gi.WebKit2 = {
    WebView: Lang.Class({
      Name: 'WebView',
      _init: function () { },
      get_settings: () => ({
        allow_universal_access_from_file_urls: false
      }),
      load_uri () { },
      connect () { },
      get_title: () => imports._title,
      run_javascript (script) {
        const actionStr = script
          .replace(/^.*?\(/, '')
          .replace(/\).*?$/, '')

        const action = JSON.parse(actionStr)
        imports._dispatched.push(action)
      }
    })
  }

  // Ensure the require is clean.
  jest.resetModules()

  const Browser = require('./browser').Browser
  const browser = new Browser()
  browser.application.run()

  return { browser, imports }
}
