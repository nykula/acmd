const { Box, Button, Label, ReliefStyle, VSeparator } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { setTimeout } = require("../Gjs/setTimeout");
const { GICON, TEXT } = require("../ListStore/ListStore");
const minLength = require("../MinLength/minLength").default;
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");
const { RefService } = require("../Ref/RefService");
const Select = require("../Select/Select").default;
const formatSize = require("../Size/formatSize").default;

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 * @property {RefService?} [refService]
 *
 * @extends Component<IProps>
 */
class Mount extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    this.onChanged = noop;
    autoBind(this, Mount.prototype, __filename);
  }

  handleFocus() {
    setTimeout(() => {
      const node = this.props.refService.get("panel" + this.props.panelId);

      if (node) {
        node.grab_focus();
      }
    }, 0);
  }

  handleLevelUp() {
    this.props.panelService.levelUp(this.props.panelId);
  }

  handleRoot() {
    this.props.panelService.root(this.props.panelId);
  }

  /**
   * @param {Button} button
   */
  refLevelUp(button) {
    button.connect("clicked", this.handleLevelUp);
  }

  /**
   * @param {Button} button
   */
  refRoot(button) {
    button.connect("clicked", this.handleRoot);
  }

  render() {
    const { panelId, panelService, placeService } = this.props;
    const { entities, names } = placeService;

    const activeUri = panelService.getActiveMountUri(panelId);

    const activeMount = names
      .map(x => entities[x])
      .filter(mount => mount.rootUri === activeUri)[0];

    const name = activeMount.name;

    const status = "[" + name + "] " +
      formatSize(activeMount.filesystemFree) + " of " +
      formatSize(activeMount.filesystemSize) + " free";

    return (
      h(Box, { expand: false }, [
        h(Box, [
          h(Select, {
            cols: [
              { name: "text", type: TEXT, pack: "pack_end" },
              { name: "icon", type: GICON },
            ],
            on_changed: this.onChanged,
            on_focus: this.handleFocus,
            on_layout: this.props.refService.set("mounts" + this.props.panelId),
            rows: names.map(x => entities[x]).map(mount => ({
              icon: {
                icon: mount.icon,
                iconType: mount.iconType,
              },
              text: minLength(names, mount.name),
              value: mount.name,
            })),
            value: name,
          }),
        ]),
        h(Box, { border_width: 4, expand: true }, [
          h(Label, { label: status }),
        ]),
        h(VSeparator),
        h(Box, [
          h(Button, {
            ref: this.refRoot,
            relief: ReliefStyle.NONE,
          }, [
              h(Label, { label: "\\" }),
            ]),
          h(Button, {
            ref: this.refLevelUp,
            relief: ReliefStyle.NONE,
          }, [
              h(Label, { label: ".." }),
            ]),
        ]),
      ])
    );
  }
}

exports.Mount = Mount;
exports.default = connect(["panelService", "placeService", "refService"])(Mount);
