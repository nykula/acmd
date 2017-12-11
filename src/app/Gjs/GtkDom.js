const noop = require("lodash/noop");
const { MenuItemWithSubmenu } = require("../Menu/MenuItemWithSubmenu");
const { TreeView } = require("../TreeView/TreeView");
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

function getParentNode() {
  return this.parent;
}

function removeAllChildren() {
  const node = this;
  this.forall(function(/** @type {any} */ x) {
    node.remove(x);
  });
}

function GtkDom(GLib = imports.gi.GLib, Gtk = imports.gi.Gtk, _window = window) {
  this.createElement = this.createElement.bind(this);
  this.domify = this.domify.bind(this);
  this.require = this.require.bind(this);

  this.GLib = GLib;

  /** @type {{ [key: string]: any }} */
  this.Gtk = Gtk;

  this.window = _window;
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
    this.remove(child);
    return child;
  };

  Object.defineProperties(node, {
    firstChild: { configurable: true, get: getFirstChild },
    nextSibling: { configurable: true, get: getNextSibling },
    parentNode: { configurable: true, get: getParentNode },
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
      const _children = this.get_children()
        .map(getValue)
        .filter((/** @type {any} */ x) => x !== ownValue);
      if (_children.length) {
        children = _children;
      }
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
    return new MenuItemWithSubmenu(this.domify(new this.Gtk.MenuItem()));
  }

  if (tagName === "stub") {
    return new Stub();
  }

  if (tagName === "stub-box") {
    return new Stub(this.domify(new this.Gtk.Box()));
  }

  if (tagName === "tree-view") {
    return new TreeView(this.domify(new this.Gtk.TreeView()));
  }

  tagName = tagName.replace(/(?:^|-)(.)/g, (_, x) => x.toUpperCase());
  return this.domify(new this.Gtk[tagName]());
};

/**
 * Returns environment variables.
 */
GtkDom.prototype.getEnv = function() {
  /** @type {string[]} */
  const pairs = this.GLib.get_environ();

  /** @type {{ [name: string]: string }} */
  const env = {};

  for (const pair of pairs) {
    const match = pair.match(/^([^=]+)=(.*)$/);
    env[match[1]] = match[2];
  }

  return env;
};

/**
 * Inits GTK. Sets console, document, global, navigator and process globals.
 */
GtkDom.prototype.require = function() {
  this.Gtk.init(null);

  /** @type {any} */
  const window = this.window;
  window.document = window.global = window;
  window.createElement = this.createElement;
  window.navigator = {};
  window.process = { env: this.getEnv() };
  window.console = { error: print, log: print, warn: print };
  window.setTimeout = setTimeout;

  exports.domify = this.domify;
};

exports.GtkDom = GtkDom;
