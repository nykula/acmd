const assign = require("lodash/assign");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");

class MenuItemWithSubmenu {
  /**
   * @param {MenuItemWithSubmenu} node
   */
  constructor(node, document = window.document) {
    /** @type {typeof document} */
    this.document = document;

    /**
     * Gtk menu widget, patched with `../Gjs/GtkDom`.
     * @type {any}
     */
    this.submenu = undefined;

    node.document = document;
    this.useNodeAsThis.call(node);
    return node;
  }

  useNodeAsThis() {
    autoBind(this, MenuItemWithSubmenu.prototype, __filename);
    this.submenu = this.document.createElement("menu");

    Object.defineProperties(this, {
      firstChild: { get: () => this.submenu.firstChild },
      textContent: { set: (value) => this.submenu.textContent = value },
    });
  }

  /**
   * @param {any} newChild
   * @param {any=} existingChild
   */
  insertBefore(newChild, existingChild) {
    return this.submenu.insertBefore(newChild, existingChild);
  }

  /**
   * @param {any} newChild
   */
  appendChild(newChild) {
    this.submenu.appendChild(newChild);
  }

  /**
   * @param {any} row
   */
  removeChild(row) {
    return this.submenu.removeChild(row);
  }

  /**
   * @param {any} newChild
   * @param {any} oldChild
   */
  replaceChild(newChild, oldChild) {
    return this.submenu.replaceChild(newChild, oldChild);
  }
}

exports.MenuItemWithSubmenu = MenuItemWithSubmenu;
