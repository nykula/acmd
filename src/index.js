/* global imports, ARGV */
// Runs the application.

const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const actions = require('./actions')
const Component = require('inferno-component')
const Dialog = require('./utils/Dialog').default
const GioAdapter = require('./adapters/Gio').default
const h = require('inferno-hyperscript')
const { Provider } = require('inferno-redux')
const Refstore = require('./utils/Refstore').default
const { render } = require('inferno')
const Store = require('./Store').default

function View (props) {
  Component.call(this, props)
  this.state = { render: this.props.render }
}

View.prototype = Object.create(Component.prototype)

View.prototype.render = function () {
  return this.state.render({ refstore: this.props.refstore })
}

require('./utils/GtkDom').app({
  on_activate: ({ win }) => {
    win.set_keep_above(false)
  },

  on_startup: ({ win }) => {
    win.default_width = 800
    win.default_height = 600
    win.window_position = Gtk.WindowPosition.CENTER

    // Dependency injection container.
    const extra = {
      Dialog: null,
      GLib: GLib,
      Gio: Gio,
      gioAdapter: null,
      Gtk: Gtk,
      refstore: new Refstore(),
      win: win
    }
    extra.Dialog = Dialog(extra)
    extra.gioAdapter = new GioAdapter(extra)

    const store = Store(undefined, extra)

    let view
    render(
      h(Provider, { store: store },
        h(View, {
          ref: instance => { view = instance },
          refstore: extra.refstore,
          render: require('./App').render
        })
      ),
      win
    )

    store.dispatch(actions.refresh())

    if (module.hot) {
      module.hot.accept('./App', () => {
        view.setState({ render: require('./App').render })
      })
    }
  }
}).run(ARGV)
