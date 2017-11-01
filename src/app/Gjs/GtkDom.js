const noop = require("lodash/noop");
const { MenuItemWithSubmenu } = require("../Menu/MenuItemWithSubmenu");
const { TreeView } = require("../TreeView/TreeView");
const { TreeViewRow } = require("../TreeView/TreeViewRow");
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
  this.forall(function(x) {
    node.remove(x);
  });
}

/**
 * @param {any} GLib
 * @param {any} Gtk
 * @param {any} _window
 */
function GtkDom(GLib = imports.gi.GLib, Gtk = imports.gi.Gtk, _window = window) {
  this.app = this.app.bind(this);
  this.createElement = this.createElement.bind(this);
  this.domify = this.domify.bind(this);
  this.require = this.require.bind(this);

  this.document = _window;
  this.GLib = GLib;
  this.Gtk = Gtk;
  this.window = _window;
}

/**
 * Monkey-patches a GTK+ widget to resemble a DOM node.
 */
GtkDom.prototype.domify = function(node) {
  node.setAttribute = function(name, value) {
    this[name] = value;
  };

  node.removeAttribute = function(name) {
    this[name] = null;
  };

  node.appendChild = function(node) {
    this.add(node);

    Object.keys(node).filter(x => /^on_/.test(x)).forEach(x => {
      const signal = x.slice(3);
      node.connect(signal, node[x]);
    });

    node.show();
  };

  node.removeChild = function(node) {
    this.remove(node);
    return node;
  };

  Object.defineProperties(node, {
    firstChild: { configurable: true, get: getFirstChild },
    nextSibling: { configurable: true, get: getNextSibling },
    parentNode: { configurable: true, get: getParentNode },
    textContent: { configurable: true, get: noop, set: removeAllChildren },
  });

  node.insertBefore = function(newChild, existingChild) {
    if (newChild.parent) {
      newChild.parent.remove(newChild);
    }

    if (existingChild) {
      const children = this.get_children();
      const position = children.indexOf(existingChild);

      children.forEach(x => {
        this.remove(x);
      });

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

    const getValue = (node) => {
      let value;

      const keys = ["icon_name", "label", "tooltip_text"];
      keys.forEach(key => {
        if (value === undefined && node[key]) {
          value = node[key];
        }
      });

      return value;
    };

    const value = getValue(this);

    try {
      const _children = this.get_children().map(getValue).filter(x => x !== value);
      if (_children.length) {
        children = _children;
      }
    } catch (err) {
      // Is not a container.
    }

    const result = [
      value !== undefined ? value : imports.gi.GObject.type_name(node),
      children,
    ].filter(x => x !== undefined);

    return JSON.stringify(result);
  };

  node.ownerDocument = this.document;

  return node;
};

/**
 * Instantiates a GTK+ widget associated with a given tag name. Assigns helpers
 * for it to be compatible with Inferno.
 */
GtkDom.prototype.createElement = function(tagName) {
  if (tagName === "menu-item-with-submenu") {
    return new MenuItemWithSubmenu(this.domify(new this.Gtk.MenuItem()));
  }

  if (tagName === "stub") {
    return new Stub(this.domify({}));
  }

  if (tagName === "tree-view") {
    return new TreeView(this.domify(new this.Gtk.TreeView()));
  }

  if (tagName === "tree-view-row") {
    return new TreeViewRow();
  }

  tagName = tagName.replace(/(?:^|-)(.)/g, (_, x) => x.toUpperCase());
  return this.domify(new this.Gtk[tagName]());
};

/**
 * Creates a Gtk application with a main window.
 */
GtkDom.prototype.app = function({ on_activate, on_startup }) {
  const Gtk = imports.gi.Gtk;
  const app = new Gtk.Application();
  let win;
  app.connect("startup", () => {
    win = this.domify(new Gtk.ApplicationWindow({ application: app }));
    on_startup({ app: app, win: win });
  });
  app.connect("activate", () => {
    win.show_all();
    on_activate({ app: app, win: win });
  });
  return app;
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
 * Exports own `app` as static function.
 */
GtkDom.prototype.require = function() {
  this.Gtk.init(null);

  const window = this.window;
  window.document = window.global = window;
  window.createElement = this.createElement;
  window.navigator = {};
  window.process = { env: this.getEnv() };
  window.console = { error: print, log: print, warn: print };
  window.setTimeout = setTimeout;

  exports.app = this.app;
};

exports.GtkDom = GtkDom;
