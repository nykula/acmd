// Runs the application.

const Gtk = imports.gi.Gtk;
const { render } = require("inferno");
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { Provider } = require("inferno-mobx");
const Refstore = require("./Refstore/Refstore").default;
const { Services } = require("./Services");

/**
 * @typedef IProps
 * @property {Refstore} refstore
 *
 * @param {IProps} props
 */
function View(props) {
  Component.call(this, props);
  this.state = { render: this.props.render };
}

View.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
View.prototype.props = undefined;

View.prototype.render = function() {
  return this.state.render({ refstore: this.props.refstore });
};

require("./Gjs/GtkDom").app({
  on_activate: ({ win }) => {
    win.set_keep_above(false);
  },

  on_startup: ({ win }) => {
    win.default_width = 800;
    win.default_height = 600;
    win.window_position = Gtk.WindowPosition.CENTER;

    // Dependency injection container.
    const services = new Services(win);

    let view;
    render(
      h(Provider, services, h(View, {
        ref: instance => { view = instance; },
        refstore: services.refstore,
        render: require("./App").render,
      })),
      win,
    );

    services.actionService.refresh();

    if (module.hot) {
      module.hot.accept("./App", () => {
        view.setState({ render: require("./App").render });
      });
    }
  },
}).run(ARGV);
