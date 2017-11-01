const assign = require("lodash/assign");
const noop = require("lodash/noop");
const autoBind = require("../Gjs/autoBind").default;

/**
 * @param {MenuItemWithSubmenu} node
 */
function MenuItemWithSubmenu(node, _document = document) {
  node.document = _document;
  this.useNodeAsThis.call(node);
  return node;
}

/** @type {typeof document} */
MenuItemWithSubmenu.prototype.document = undefined;

/**
 * Gtk menu widget, patched with `../Gjs/GtkDom`.
 * @type {any}
 */
MenuItemWithSubmenu.prototype.submenu = undefined;

MenuItemWithSubmenu.prototype.useNodeAsThis = function() {
  autoBind(this, MenuItemWithSubmenu.prototype, __filename);

  this.submenu = this.document.createElement("menu");
  this.set_submenu(this.submenu);

  Object.defineProperties(this, {
    firstChild: { get: () => this.submenu.firstChild },
    textContent: { set: (value) => this.submenu.textContent = value },
  });
};

/**
 * @param {any} newChild
 * @param {any=} existingChild
 */
MenuItemWithSubmenu.prototype.insertBefore = function(newChild, existingChild) {
  return this.submenu.insertBefore(newChild, existingChild);
};

/**
 * @param {any} newChild
 */
MenuItemWithSubmenu.prototype.appendChild = function(newChild) {
  this.submenu.appendChild(newChild);
};

/**
 * @param {any} row
 */
MenuItemWithSubmenu.prototype.removeChild = function(row) {
  return this.submenu.removeChild(row);
};

/**
 * @param {any} newChild
 * @param {any} oldChild
 */
MenuItemWithSubmenu.prototype.replaceChild = function(newChild, oldChild) {
  return this.submenu.replaceChild(newChild, oldChild);
};

/**
 * Native method. Sets submenu.
 * @type {(gtkMenu: any) => void}
 */
MenuItemWithSubmenu.prototype.set_submenu = undefined;

exports.MenuItemWithSubmenu = MenuItemWithSubmenu;
