/* global imports, ARGV */
// Runs the application.

const Gdk = imports.gi.Gdk
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const actions = require('./actions')
const Component = require('inferno-component')
const Dialog = require('./utils/Dialog').default
const h = require('inferno-hyperscript')
const { render } = require('inferno')
const Store = require('./Store').default

function Provider (props) {
  Component.call(this, props)
  this.state = { render: this.props.render }
}

Provider.prototype = Object.create(Component.prototype)

Provider.prototype.render = function () {
  return this.state.render(this.props.store)
}

require('./utils/GtkDom').app({
  on_activate: ({ win }) => {
    win.set_keep_above(true)
  },

  on_startup: ({ win }) => {
    win.default_width = 800
    win.default_height = 600
    win.window_position = Gtk.WindowPosition.CENTER

    const store = Store(undefined, {
      Dialog: Dialog({ Gtk: Gtk, win: win }),
      Gdk: Gdk,
      Gio: Gio,
      GLib: GLib,
      Gtk: Gtk,
      win: win,
      nextTick: (callback) => {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
          callback()
        })
      }
    })

    let provider
    render(
      h(Provider, {
        ref: instance => { provider = instance },
        render: require('./App').render,
        store: store
      }),
      win
    )

    let state
    store.subscribe(() => {
      const newState = store.getState()
      if (newState !== state) {
        state = newState
        provider.forceUpdate()
      }
    })

    store.dispatch(actions.refresh())

    if (module.hot) {
      module.hot.accept('./App', () => {
        provider.setState({ render: require('./App').render })
      })
    }
  }
}).run(ARGV)
