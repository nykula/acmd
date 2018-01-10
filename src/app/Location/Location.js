const { Box, Label, ListBox, ListBoxRow } = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { action, autorun, extendObservable, observable } = require("mobx");
const Nullthrows = require("nullthrows").default;
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const { UriService } = require("../Uri/UriService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {UriService?} [uriService]
 *
 * @extends Component<IProps>
 */
class Location extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);

    /** @type {ListBox | null} */
    this.list = null;

    /** @type {ListBoxRow | null} */
    this.row = null;

    autoBind(this, Location.prototype, __filename);
    extendObservable(this, {
      list: observable.ref(undefined),
      refList: action(this.refList),
      refRow: action(this.refRow),
      row: observable.ref(undefined),
    });
    this.unsubscribeSelection = autorun(this.updateSelection);
  }

  componentWillUnmount() {
    this.unsubscribeSelection();
  }

  isActive() {
    const { activeId } = Nullthrows(this.props.panelService);

    return activeId === this.props.panelId;
  }

  /**
   * @param {ListBox | null} node
   */
  refList(node) {
    this.list = node;
  }

  /**
   * @param {ListBoxRow | null} node
   */
  refRow(node) {
    this.row = node;
  }

  updateSelection() {
    if (!this.list || !this.row) {
      return;
    }

    if (this.isActive()) {
      this.list.select_row(this.row);
    } else {
      this.list.unselect_row(this.row);
    }
  }

  render() {
    const { getActiveTab } = Nullthrows(this.props.panelService);
    const { unescape } = Nullthrows(this.props.uriService);

    const { location } = getActiveTab(this.props.panelId);
    const label = unescape(location).replace(/\/?$/, "/*");

    return h(ListBox, { ref: this.refList }, [
      h(ListBoxRow, { ref: this.refRow }, [
        h(Box, { border_width: 2 }, [
          h(Box, { border_width: 2 }),
          h(Label, {
            ellipsize: EllipsizeMode.MIDDLE,
            label: label,
          }),
        ]),
      ]),
    ]);
  }
}

exports.Location = Location;
exports.default = connect(["panelService", "uriService"])(Location);
