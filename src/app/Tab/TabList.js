const { Box } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const TabListItem = require("./TabListItem").default;

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 *
 * @extends Component<IProps>
 */
class TabList extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, TabList.prototype, __filename);
  }

  render() {
    const { entities } =
      /** @type {PanelService} */ (this.props.panelService);

    const panel = entities[this.props.panelId];
    const { activeTabId, tabIds } = panel;

    return tabIds.length === 1 ? h(Box) : (
      h(Box, tabIds.map(id => (
        h(TabListItem, {
          active: activeTabId === id,
          id: id,
          key: id,
          panelId: this.props.panelId,
        })),
      ))
    );
  }
}

exports.TabList = TabList;
exports.default = connect(["panelService"])(TabList);
