const Gtk = imports.gi.Gtk;

const { noop } = require("lodash");
const { MenuItemWithSubmenu } = require("../Menu/MenuItemWithSubmenu");
const { autoBind } = require("./autoBind");
const { setTimeout } = require("./setTimeout");
const { Stub } = require("./Stub");

function getFirstChild() {
  const children = this.get_children();
  return children.length ? children[0] : null;
}

function getNextSibling() {
  const siblings = this.parent.get_children();
  return siblings[siblings.indexOf(this) + 1] || null;
}

function removeAllChildren() {
  const node = this;
  this.forall(function(/** @type {any} */ x) {
    node.remove(x);
  });
}

function GtkDom() {
  autoBind(this, GtkDom.prototype, __filename);

  /** @type {{ [key: string]: any }} */
  this.Gtk = Gtk;

  this.window = window;
}

/**
 * Monkey-patches a GTK+ widget to resemble a DOM node.
 *
 * @param {any} node
 */
GtkDom.prototype.domify = function(node) {
  /**
   * @param {string} name
   * @param {any} value
   */
  node.setAttribute = function(name, value) {
    this[name] = value;
  };

  /**
   * @param {string} name
   */
  node.removeAttribute = function(name) {
    this[name] = null;
  };

  /**
   * @param {any} child
   */
  node.appendChild = function(child) {
    child.parentNode = this;
    this.add(child);

    Object.keys(child).filter(x => /^on_/.test(x)).forEach(x => {
      const signal = x.slice(3);
      child.connect(signal, child[x]);
    });

    child.show();
  };

  /**
   * @param {any} child
   */
  node.removeChild = function(child) {
    child.parentNode = null;
    this.remove(child);
    return child;
  };

  Object.defineProperties(node, {
    firstChild: { configurable: true, get: getFirstChild },
    nextSibling: { configurable: true, get: getNextSibling },
    textContent: { configurable: true, get: noop, set: removeAllChildren },
  });

  /**
   * @param {any} newChild
   * @param {any} existingChild
   */
  node.insertBefore = function(newChild, existingChild) {
    if (newChild.parent) {
      newChild.parent.remove(newChild);
    }

    newChild.parentNode = this;

    if (existingChild) {
      const children = this.get_children();
      const position = children.indexOf(existingChild);

      for (const x of children) {
        this.remove(x);
      }

      for (let i = 0; i < position; i++) {
        this.add(children[i]);
      }

      this.add(newChild);

      for (let i = position; i < children.length; i++) {
        this.add(children[i]);
      }
    } else {
      this.add(newChild);
    }

    return newChild;
  };

  /**
   * @param {any} newChild
   * @param {any} oldChild
   */
  node.replaceChild = function(newChild, oldChild) {
    if (!newChild.parent) {
      newChild.show();
    }

    this.insertBefore(newChild, oldChild);
    return this.remove(oldChild);
  };

  /**
   * Returns a shallow debug representation of the node.
   */
  node.toString = function() {
    let children;

    /**
     * @param {{ [key: string]: any }} x
     */
    const getValue = x => {
      /** @type {any} */
      let value;

      const keys = ["icon_name", "label", "tooltip_text"];
      keys.forEach(key => {
        if (value === undefined && x[key]) {
          value = x[key];
        }
      });

      return value;
    };

    const ownValue = getValue(this);

    try {
      children = this.get_children()
        .map(getValue)
        .filter((/** @type {any} */ x) => x !== ownValue);
    } catch (err) {
      // Is not a container.
    }

    const result = [
      ownValue !== undefined ? ownValue : imports.gi.GObject.type_name(node),
      children,
    ].filter(x => x !== undefined);

    return JSON.stringify(result);
  };

  node.ownerDocument = this.window;

  return node;
};

/**
 * Instantiates a GTK+ widget associated with a given tag name. Assigns helpers
 * for it to be compatible with Inferno.
 *
 * @param {string} tagName
 */
GtkDom.prototype.createElement = function(tagName) {
  if (tagName === "menu-item-with-submenu") {
    return new MenuItemWithSubmenu(this.domify(new Gtk.MenuItem()));
  }

  if (tagName === "stub") {
    return new Stub();
  }

  if (tagName === "stub-box") {
    return new Stub(this.domify(new Gtk.Box()));
  }

  if (tagName === "combo-box") {
    return new Stub(this.domify(new Gtk.ComboBox()));
  }

  if (tagName === "icon-view") {
    // TODO: Resolve setTimeout circular dependency.
    const { ListGrid } = require("../List/ListGrid");

    return new ListGrid(this.domify(new Gtk.IconView()));
  }

  if (tagName === "list-store") {
    return new Stub(this.domify(new Gtk.ListStore()));
  }

  if (tagName === "tree-view") {
    // TODO: Resolve setTimeout circular dependency.
    const { ListTable } = require("../List/ListTable");

    return new ListTable(this.domify(new Gtk.TreeView()));
  }

  tagName = tagName.replace(/(?:^|-)(.)/g, (_, x) => x.toUpperCase());

  const Class = (/** @type {any} */ (Gtk))[tagName];
  return this.domify(new Class());
};

/**
 * Creates a GTK+ label with given text, so Inferno can log error and insert
 * empty placeholder without crashing.
 *
 * @param {string} label
 */
GtkDom.prototype.createTextNode = function(label) {
  return this.domify(new Gtk.Label({ label }));
};

/**
 * Inits GTK. Sets document, global and navigator globals.
 */
GtkDom.prototype.require = function() {
  Gtk.init(null);

  /** @type {any} */
  const window = this.window;
  window.document = window.global = window;
  window.createElement = this.createElement;
  window.createTextNode = this.createTextNode;
  window.navigator = {};
  window.setTimeout = setTimeout;

  exports.domify = this.domify;
};

exports.GtkDom = GtkDom;
