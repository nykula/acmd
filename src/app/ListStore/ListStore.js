const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const Icon = require("../Icon/Icon").default;

const CHECKBOX = exports.CHECKBOX = "CHECKBOX";
const GICON = exports.GICON = "GICON";
const TEXT = exports.TEXT = "TEXT";

/**
 * @param {{ cols: { name: string, type: string }[], rows: any[] }} props
 */
exports.fromProps = function(props) {
  const store = new Gtk.ListStore();

  setCols(store, props.cols);

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

exports.setCols = setCols;
/**
 * @param {any} store
 * @param {{ name: string, type: string }[]} cols
 */
function setCols(store, cols) {
  store.cols = cols;
  store.set_column_types(cols.map(col => {
    if (col.type === GICON) {
      return Gio.Icon;
    }

    if (col.type === CHECKBOX) {
      return Boolean;
    }

    return String;
  }));
}

exports.setValue = setValue;
/**
 * @param {any} store
 * @param {any} iter
 * @param {string} name
 * @param {any} value
 */
function setValue(store, iter, name, value) {
  for (let i = 0; i < store.cols.length; i++) {
    const col = store.cols[i];

    if (col.name === name) {
      if (col.type === GICON) {
        value = value ? Icon(value) : null;
      } else if (col.type === TEXT) {
        value = value || "";
      }

      store.set_value(iter, i, value);
      break;
    }
  }
}

exports.configureColumn = configureColumn;
/**
 * @param {any} node
 * @param {{ on_toggled?: (row: number) => void, pack?: string, type: string }} col
 * @param {number} i
 */
function configureColumn(node, col, i) {
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
      ellipsize: EllipsizeMode.MIDDLE,
    });
  }

  node[col.pack || "pack_start"](renderer, false);
  node.add_attribute(renderer, attribute, i);
}
