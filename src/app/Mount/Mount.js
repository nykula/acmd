const { Icon } = imports.gi.Gio;
const { Box, Button, ComboBox, Label, ReliefStyle, VSeparator } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { setTimeout } = require("../Gjs/setTimeout");
const { ListStore } = require("../ListStore/ListStore");
const minLength = require("../MinLength/minLength").default;
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");
const { RefService } = require("../Ref/RefService");
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
   * @param {ComboBox} comboBox
   */
  refComboBox(comboBox) {
    if (!comboBox) {
      return;
    }

    comboBox.connect("changed", noop);
    comboBox.connect("focus", this.handleFocus);

    MountCols.forEach((col, i) => ListStore.bindView(comboBox, col, i));
    this.props.refService.set("mounts" + this.props.panelId)(comboBox);
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
          h(ComboBox, {
            active: names.findIndex(x => entities[x].name === name),
            ref: this.refComboBox,
          },
            h(ListStore, { cols: MountCols },
              names.map(x => entities[x]).map(mount => h("stub", {
                icon: mount,
                text: minLength(names, mount.name),
              })),
            ),
          ),
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

const MountCols = [
  { name: "text", pack: "pack_end" },
  { name: "icon", type: Icon },
];

exports.Mount = Mount;
exports.default = connect(["panelService", "placeService", "refService"])(Mount);
