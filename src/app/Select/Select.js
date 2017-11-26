const { ComboBox } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const isEqual = require("lodash/isEqual");
const autoBind = require("../Gjs/autoBind").default;
const ListStore = require("../ListStore/ListStore");

/**
 * @typedef IProps
 * @property {any[]} cols
 * @property {Function} on_changed
 * @property {Function} on_focus
 * @property {Function} on_layout
 * @property {any[]} rows
 * @property {string} value
 *
 * @param {IProps} props
 */
function Select(props) {
  Component.call(this, props);
  autoBind(this, Select.prototype, __filename);
}

Select.prototype = Object.create(Component.prototype);

/**
 * @type {ComboBox}
 */
Select.prototype.node = undefined;

/**
 * @type {IProps}
 */
Select.prototype.props = undefined;

/**
 * @param {ComboBox} node
 */
Select.prototype.init = function(node) {
  if (!node || this.node) {
    return;
  }

  /** @type {any} FIXME */
  const store = ListStore.fromProps(this.props);

  this.node = node;
  node.set_model(store);
  this.props.cols.forEach((col, i) => ListStore.configureColumn(node, col, i));
  this.updateActive();
  this.props.on_layout(node);
};

/**
 * @param {IProps} nextProps
 */
Select.prototype.shouldComponentUpdate = function(nextProps) {
  return !isEqual(this.props, nextProps);
};

Select.prototype.componentDidUpdate = function() {
  /** @type {any} FIXME */
  const store = ListStore.fromProps(this.props);

  this.node.set_model(store);
  this.updateActive();
};

Select.prototype.updateActive = function() {
  for (let i = 0; i < this.props.rows.length; i++) {
    if (this.props.rows[i].value === this.props.value) {
      this.node.set_active(i);
      break;
    }
  }
};

Select.prototype.render = function() {
  return h("combo-box", {
    focus_on_click: false,
    on_changed: this.props.on_changed,
    on_focus: this.props.on_focus,
    ref: this.init,
  });
};

exports.default = Select;
