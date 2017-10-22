const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Icon = require("../Icon/Icon").default;
const Pango = imports.gi.Pango;

const CHECKBOX = exports.CHECKBOX = "CHECKBOX";
const GICON = exports.GICON = "GICON";
const TEXT = exports.TEXT = "TEXT";

exports.fromProps = function(props) {
  const store = new Gtk.ListStore();

  store.set_column_types(props.cols.map(col => {
    if (col.type === GICON) {
      return Gio.Icon;
    }

    if (col.type === CHECKBOX) {
      return GObject.TYPE_BOOLEAN;
    }

    return GObject.TYPE_STRING;
  }));

  props.rows.forEach(row => {
    store.set(
      store.append(),
      props.cols.map((_, i) => i),
      props.cols.map(col => {
        if (col.type === GICON) {
          return Icon(row[col.name]);
        }

        return row[col.name];
      }),
    );
  });

  return store;
};

exports.configureColumn = function(node, col, i) {
  let attribute;
  let renderer;

  if (col.type === CHECKBOX) {
    attribute = "active";
    renderer = new Gtk.CellRendererToggle();
    renderer.connect("toggled", (_, value) => {
      col.on_toggled(Number(value));
    });
  }

  if (col.type === GICON) {
    attribute = "gicon";
    renderer = new Gtk.CellRendererPixbuf();
  }

  if (col.type === TEXT) {
    attribute = "text";
    renderer = new Gtk.CellRendererText({
      ellipsize: Pango.EllipsizeMode.MIDDLE,
    });
  }

  node[col.pack || "pack_start"](renderer, false);
  node.add_attribute(renderer, attribute, i);
};
