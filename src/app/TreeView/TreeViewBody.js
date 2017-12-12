const { ListStore, TreeIter, TreeView } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { setValue } = require("../ListStore/ListStore");
const { TreeViewRow } = require("./TreeViewRow");

class TreeViewBody extends Component {
  constructor() {
    super();

    /** @type {TreeViewRow[]} */
    this.rows = [];

    /** @type {ListStore} */
    this._store = (/** @type {any} */ (undefined));

    /** @type {{ parentNode: TreeView }} */
    this.stub = (/** @type {any} */ (undefined));

    autoBind(this, TreeViewBody.prototype, __filename);
  }

  componentDidUpdate() {
    if (this._store && !this.stub.parentNode.get_model()) {
      this.stub.parentNode.set_model(this._store);
    }
  }

  /**
   * @param {TreeViewRow} row
   */
  ensureInit(row) {
    if (row.iter) {
      return;
    }

    Object.defineProperties(row, {
      nextSibling: {
        get: () => this.rows[this.rows.indexOf(row) + 1],
      },
    });

    row.iter = this._store.append();

    /**
     * @param {string} name
     * @param {any} value
     */
    const setAttribute = (name, value) => {
      setValue(this._store, row.iter, name, value);
    };

    /** @type {{ [key: string]: any }} */
    const values = row;

    for (const name of Object.keys(row)) {
      setAttribute(name, values[name]);
    }

    row.setAttribute = setAttribute;
  }

  /**
   * @param {TreeViewRow} newChild
   * @param {TreeViewRow=} existingChild
   */
  insertBefore(newChild, existingChild) {
    this.ensureInit(newChild);
    this._store.move_before(
      /** @type {TreeIter} */ (newChild.iter),
      existingChild ? existingChild.iter : null,
    );
    const index = this.rows.indexOf(existingChild);

    if (index === -1) {
      this.rows.push(newChild);
    } else {
      this.rows.splice(index, 0, newChild);
    }

    return newChild;
  }

  /**
   * @param {TreeViewRow} newChild
   */
  appendChild(newChild) {
    if (this._store) {
      this.insertBefore(newChild);
    } else {
      this.rows.push(newChild);
    }
  }

  /**
   * @param {TreeViewRow} row
   */
  removeChild(row) {
    this._store.remove(/** @type {TreeIter} */ (row.iter));
    this.rows.splice(this.rows.indexOf(row), 1);
    return row;
  }

  /**
   * @param {TreeViewRow} newChild
   * @param {TreeViewRow} oldChild
   */
  replaceChild(newChild, oldChild) {
    this.insertBefore(newChild, oldChild);
    return this.removeChild(oldChild);
  }

  clear() {
    this.stub.parentNode.set_model(null);
    this._store.clear();
    this.rows.splice(0);
  }

  /**
   * @param {ListStore} store
   */
  setStore(store) {
    this._store = store;

    for (const row of this.rows) {
      this.ensureInit(row);
    }

    this.stub.parentNode.set_model(this._store);
  }

  /**
   * @param {any} stub
   */
  ref(stub) {
    this.rows = stub.children;

    stub.appendChild = this.appendChild;
    stub.insertBefore = this.insertBefore;
    stub.removeChild = this.removeChild;
    stub.replaceChild = this.replaceChild;

    Object.defineProperties(stub, {
      firstChild: { get: () => this.rows[0] },
      store: {
        get: () => this._store,
        set: this.setStore,
      },
      textContent: { set: () => this.clear() },
    });

    this.stub = stub;
  }

  render() {
    return h("stub", { ref: this.ref }, this.props.children);
  }
}

exports.TreeViewBody = TreeViewBody;
