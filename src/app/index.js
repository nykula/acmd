// Runs the application.

require("ts-for-gjs");
const GLib = imports.gi.GLib;
const { Application, ApplicationWindow, WindowPosition } = imports.gi.Gtk;
const { render } = require("inferno");
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { Provider } = require("inferno-mobx");
const GtkDom = require("./Gjs/GtkDom");
const { Services } = require("./Services");

/**
 * @param {any} props
 */
function View(props) {
  Component.call(this, props);
  this.state = { render: this.props.render };
}

View.prototype = Object.create(Component.prototype);

/**
 * @type {any}
 */
View.prototype.props = undefined;

View.prototype.render = function() {
  return this.state.render();
};

const title = "Acme Commander";
GLib.set_prgname(title);

const application = new Application();

/** @type {ApplicationWindow} */
let win;

application.connect("startup", () => {
  win = GtkDom.domify(new ApplicationWindow({ application }));

  win.default_width = 800;
  win.default_height = 600;
  win.title = title;
  win.window_position = WindowPosition.CENTER;

  // Dependency injection container.
  const services = new Services(win);

  /** @type {any} */
  const parentDom = win;

  /** @type {Component} */
  let view;

  /** @param {Component} instance */
  const ref = instance => {
    view = instance;
  };

  const vnodeView = h(View, {
    ref,
    render: require("./App").render,
  });

  render(h(Provider, services, vnodeView), parentDom);

  services.windowService.refresh();

  if (process.env.NODE_ENV === "development" && module.hot) {
    module.hot.accept("./App", () => {
      view.setState({ render: require("./App").render });
    });
  }
});

application.connect("activate", () => {
  win.show_all();
  win.set_icon_name("media-floppy");
  win.set_keep_above(false);
});

application.run(ARGV);
