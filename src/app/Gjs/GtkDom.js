const noop = require("lodash/noop");

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
 * @param {any} Gtk
 * @param {any} _window
 */
function GtkDom(Gtk = imports.gi.Gtk, _window = window) {
  this.app = this.app.bind(this);
  this.createElement = this.createElement.bind(this);
  this.domify = this.domify.bind(this);
  this.require = this.require.bind(this);

  this.document = _window;
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
  };

  Object.defineProperties(node, {
    firstChild: { get: getFirstChild },
    nextSibling: { get: getNextSibling },
    parentNode: { get: getParentNode },
    textContent: { get: noop, set: removeAllChildren },
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
  };

  node.replaceChild = function(newChild, oldChild) {
    if (!newChild.parent) {
      newChild.show();
    }

    this.insertBefore(newChild, oldChild);
    this.remove(oldChild);
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
 * Inits GTK. Assigns createElement on window. Points document and global to
 * window. Sets navigator and process.env to empty objects. Aliases print as
 * console.error, console.log and console.warn. Exports own `app` as static
 * function on this module.
 */
GtkDom.prototype.require = function() {
  this.Gtk.init(null);

  const window = this.window;
  window.document = window.global = window;
  window.createElement = this.createElement;
  window.navigator = {};
  window.process = { env: {} };
  window.console = { error: print, log: print, warn: print };

  exports.app = this.app;
};

exports.GtkDom = GtkDom;
