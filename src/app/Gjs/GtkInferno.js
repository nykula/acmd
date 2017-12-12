const hyperscript = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");

exports.connect = connect;

/**
 * @see ./GtkInferno.d.ts
 * @param {any} component
 * @param {any=} props
 * @param {any=} children
 */
function h(component, props, children) {
  if (typeof component !== "string" && "new" in component) {
    // Gtk widget.
    component = component.name
      .replace(/.+_/, "")
      .replace(/([A-Z])/g, "-$1")
      .slice(1)
      .toLowerCase();
  }

  return hyperscript(component, props, children);
}

exports.h = h;
