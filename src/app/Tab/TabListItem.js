const { Box, IconSize, Image, Label, ReliefStyle } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;

/**
 * @typedef IProps
 * @property {boolean} active
 * @property {string} icon
 * @property {number} id
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {TabService?} [tabService]
 *
 * @extends Component<IProps>
 */
class TabListItem extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, TabListItem.prototype, __filename);
  }

  handleClicked() {
    const panelService = /** @type {PanelService} */ (this.props.panelService);
    panelService.setActiveTab(this.props.id);
  }

  render() {
    const { active, icon } = this.props;
    const { entities } = /** @type {TabService} */ (this.props.tabService);

    const { location } = entities[this.props.id];
    let text = location.replace(/^.*\//, "") || "/";

    return (
      h(ToggleButton, {
        active: active,
        can_focus: false,
        pressedCallback: this.handleClicked,
        relief: ReliefStyle.NONE,
      }, [
          h(Box, { spacing: 4 }, [
            icon ? (
              h(Image, {
                icon_name: icon + "-symbolic",
                icon_size: IconSize.SMALL_TOOLBAR,
              })
            ) : null,
            h(Label, { label: text }),
          ]),
        ])
    );
  }
}

exports.TabListItem = TabListItem;
exports.default = inject("panelService", "tabService")(observer(TabListItem));
