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

class View extends Component {
  /**
   * @param {any} props
   */
  constructor(props) {
    super(props);
    this.state = { render: this.props.render };
  }

  render() {
    return this.state.render();
  }
}

/** @type {Component} */
View.instance = (/** @type {any} */ (undefined));

/** @param {Component} instance */
View.ref = instance => {
  View.instance = instance;
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

  const vnodeView = h(View, {
    ref: View.ref,
    render: require("./App").render,
  });

  render(
    h(Provider, services, vnodeView),
    /** @type {any} */ (win),
  );

  services.windowService.refresh();

  if (process.env.NODE_ENV === "development" && module.hot) {
    module.hot.accept("./App", () => {
      View.instance.setState({ render: require("./App").render });
    });
  }
});

application.connect("activate", () => {
  win.show_all();
  win.set_icon_name("media-floppy");
  win.set_keep_above(false);
});

application.run(ARGV);
