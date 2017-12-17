const { Box, Entry, Label } = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { DirectoryService } = require("../Directory/DirectoryService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");

/**
 * @typedef IProps
 * @property {DirectoryService?} [directoryService]
 * @property {PanelService?} [panelService]
 *
 * @extends Component<IProps>
 */
class Prompt extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, Prompt.prototype, __filename);
  }

  /**
   * @param {{ text: string | null }} entry
   */
  handleActivate(entry) {
    const { exec } =
      /** @type {DirectoryService} */ (this.props.directoryService);

    if (entry.text) {
      exec(entry.text);
    }
  }

  /**
   * @param {Entry | null} entry
   */
  ref(entry) {
    if (entry) {
      entry.connect("activate", this.handleActivate);
    }
  }

  render() {
    const { getActiveTab } =
      /** @type {PanelService} */ (this.props.panelService);

    const { location } = getActiveTab();

    return (
      h(Box, { expand: false }, [
        h(Box, { border_width: 4 }),
        h(Label, {
          ellipsize: EllipsizeMode.MIDDLE,
          label: location.replace(/^file:\/\//, "") + "$",
        }),
        h(Box, { border_width: 4 }),
        h(Entry, { expand: true, ref: this.ref }),
      ])
    );
  }
}

exports.Prompt = Prompt;
exports.default = connect(["directoryService", "panelService"])(Prompt);
