const { Box, Entry, Label } = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const nullthrows = require("nullthrows").default;
const { DirectoryService } = require("../Directory/DirectoryService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const { UriService } = require("../Uri/UriService");

/**
 * @typedef IProps
 * @property {DirectoryService?} [directoryService]
 * @property {PanelService?} [panelService]
 * @property {UriService?} [uriService]
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
    const { exec } = nullthrows(this.props.directoryService);

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
    const { getActiveTab } = nullthrows(this.props.panelService);
    const { unescape } = nullthrows(this.props.uriService);

    const { location } = getActiveTab();
    const label = unescape(location) + "$";

    return h(Box, { expand: false }, [
      h(Box, { border_width: 4 }),
      h(Label, {
        ellipsize: EllipsizeMode.MIDDLE,
        label,
      }),
      h(Box, { border_width: 4 }),
      h(Entry, { expand: true, ref: this.ref }),
    ]);
  }
}

exports.Prompt = Prompt;
exports.default = inject("directoryService", "panelService", "uriService")(observer(
  Prompt,
));
