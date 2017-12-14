const { Icon } = imports.gi.Gio;
const {
  CellRenderer,
  CellRendererPixbuf,
  CellRendererText,
  CellRendererToggle,
  ListStore,
  TreeIter,
  TreeView,
} = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const Component = require("inferno-component").default;
const noop = require("lodash/noop");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { Stub } = require("../Gjs/Stub");

/**
 * GtkListStore with columns as a prop, and rows as children.
 *
 * @typedef IStub
 * @property {Stub[]} children
 * @property {{ model: ListStore }} parentNode
 *
 * @typedef IProps
 * @property {{ name: string, type?: any }[]} cols
 *
 * @extends Component<IProps>
 */
class ListStoreComponent extends Component {
  /**
   * Renders a column in a ComboBox or TreeView.
   *
   * @param {any} widget
   * @param {{ on_toggled?: (row: number) => void, pack?: string, type?: any }} col
   * @param {number} i
   */
  static bindView(widget, col, i) {
    let attribute = "";

    /** @type {CellRenderer} */
    let renderer = (/** @type {any} */ (undefined));

    switch (col.type || undefined) {
      case Icon:
        attribute = "gicon";
        renderer = new CellRendererPixbuf();
        break;

      case Boolean:
        attribute = "active";
        const toggle = new CellRendererToggle();

        toggle.connect("toggled", (_, value) => {
          (col.on_toggled || noop)(Number(value));
        });

        renderer = toggle;
        break;

      default:
        attribute = "text";
        renderer = new CellRendererText({
          ellipsize: EllipsizeMode.MIDDLE,
        });
    }

    widget[col.pack || "pack_start"](renderer, false);
    widget.add_attribute(renderer, attribute, i);
  }

  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);

    /** @type {ListStore & IStub} */
    this.store = (/** @type {any} */ (undefined));

    autoBind(this, ListStoreComponent.prototype, __filename);
  }

  componentDidMount() {
    /** @type {any} */
    const store = this.store;

    Object.defineProperties(store, {
      textContent: { set: () => this.clear() },
    });

    store.appendChild = this.insertBefore;
    store.insertBefore = this.insertBefore;
    store.removeChild = this.removeChild;
    store.replaceChild = this.replaceChild;

    for (const row of this.store.children) {
      this.ensureInit(row);
    }

    this.store.parentNode.model = this.store;
  }

  /**
   * Lets parent render new rows again, if model unset by `clear`.
   */
  componentDidUpdate() {
    if (this.store && !this.store.parentNode.model) {
      this.store.parentNode.model = this.store;
    }
  }

  /**
   * Removes all rows before a major change. Unbinds the model from parent,
   * to delay render until all new rows are added.
   */
  clear() {
    this.store.parentNode.model = (/** @type {any} */ (null));
    this.store.clear();
    this.store.children.splice(0);
  }

  /**
   * Connects a stub row to a store iter.
   *
   * @param {Stub} row
   */
  ensureInit(row) {
    if (row.iter) {
      return;
    }

    Object.defineProperties(row, {
      nextSibling: {
        get: () => this.store.children[this.store.children.indexOf(row) + 1],
      },
    });

    row.iter = this.store.append();

    /** @type {{ [key: string]: any }} */
    const values = row;

    for (const name of Object.keys(row)) {
      this.setValue(row.iter, name, values[name]);
    }

    row.setAttribute = this.setValue.bind(this, row.iter);
  }

  /**
   * @param {Stub} newChild
   * @param {Stub=} existingChild
   */
  insertBefore(newChild, existingChild) {
    this.ensureInit(newChild);
    this.store.move_before(
      /** @type {TreeIter} */ (newChild.iter),
      existingChild ? existingChild.iter : null,
    );
    const index = this.store.children.indexOf(existingChild);

    if (index === -1) {
      this.store.children.push(newChild);
    } else {
      this.store.children.splice(index, 0, newChild);
    }

    return newChild;
  }

  /**
   * @param {Stub} row
   */
  removeChild(row) {
    this.store.remove(/** @type {TreeIter} */ (row.iter));
    this.store.children.splice(this.store.children.indexOf(row), 1);
    return row;
  }

  /**
   * @param {Stub} newChild
   * @param {Stub} oldChild
   */
  replaceChild(newChild, oldChild) {
    this.insertBefore(newChild, oldChild);
    return this.removeChild(oldChild);
  }

  /**
   * @param {any} iter
   * @param {string} name
   * @param {any} value
   */
  setValue(iter, name, value) {
    const { cols } = this.props;
    const store = this.store;

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];

      if (col.name === name) {
        const type = col.type || undefined;

        if (type === Icon) {
          value = value ? GioIcon.get(value) : null;
        } else if (type === Boolean) {
          value = !!value;
        } else {
          value = value || "";
        }

        store.set_value(iter, i, value);
        break;
      }
    }
  }

  /**
   * Saves a reference to the ListStore created by GtkDom.
   *
   * @param {any} store
   */
  ref(store) {
    if (!store) {
      return;
    }

    store.set_column_types(this.props.cols.map(col => col.type || String));
    this.store = store;
  }

  render() {
    return h("list-store", { ref: this.ref }, this.props.children);
  }
}

exports.ListStore = ListStoreComponent;
