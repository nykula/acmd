const hyperscript = require("inferno-hyperscript").default;

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
