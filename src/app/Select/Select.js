const { ComboBox } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const isEqual = require("lodash/isEqual");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
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
 * @extends Component<IProps>
 */
class Select extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);

    /**
     * @type {ComboBox}
     */
    this.node = (/** @type {any} */ (undefined));

    autoBind(this, Select.prototype, __filename);
  }

  /**
   * @param {IProps} nextProps
   */
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  componentDidUpdate() {
    const store = ListStore.fromProps(this.props);

    this.node.set_model(store);
    this.updateActive();
  }

  updateActive() {
    for (let i = 0; i < this.props.rows.length; i++) {
      if (this.props.rows[i].value === this.props.value) {
        this.node.set_active(i);
        break;
      }
    }
  }

  /**
   * @param {ComboBox} node
   */
  ref(node) {
    if (!node || this.node) {
      return;
    }

    this.node = node;
    node.connect("changed", this.props.on_changed);
    node.connect("focus", this.props.on_focus);

    const store = ListStore.fromProps(this.props);
    node.set_model(store);
    this.props.cols.forEach((col, i) => ListStore.configureColumn(node, col, i));

    this.updateActive();
    this.props.on_layout(node);
  }

  render() {
    return (
      h(ComboBox, {
        focus_on_click: false,
        ref: this.ref,
      })
    );
  }
}

exports.default = Select;
