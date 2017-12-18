const { Icon } = imports.gi.Gio;
const { Box, Button, ComboBox, Label, ReliefStyle, VSeparator } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { setTimeout } = require("../Gjs/setTimeout");
const { ListStore } = require("../ListStore/ListStore");
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
      const { get } =
        /** @type { RefService } */ (this.props.refService);

      const node = get("panel" + this.props.panelId);

      if (node) {
        node.grab_focus();
      }
    }, 0);
  }

  handleLevelUp() {
    const { levelUp } =
      /** @type { PanelService } */ (this.props.panelService);

    levelUp(this.props.panelId);
  }

  handleRoot() {
    const { root } =
      /** @type { PanelService } */ (this.props.panelService);

    root(this.props.panelId);
  }

  /**
   * @param {ComboBox | null} comboBox
   */
  refComboBox(comboBox) {
    if (!comboBox) {
      return;
    }

    const { set } =
      /** @type { RefService } */ (this.props.refService);

    comboBox.connect("changed", noop);
    comboBox.connect("focus", this.handleFocus);

    MountCols.forEach((col, i) => ListStore.bindView(comboBox, col, i));
    set("mounts" + this.props.panelId)(comboBox);
  }

  /**
   * @param {Button | null} button
   */
  refLevelUp(button) {
    if (button) {
      button.connect("clicked", this.handleLevelUp);
    }
  }

  /**
   * @param {Button | null} button
   */
  refRoot(button) {
    if (button) {
      button.connect("clicked", this.handleRoot);
    }
  }

  render() {
    const { getActiveTab } =
      /** @type { PanelService } */ (this.props.panelService);

    const { getActive, places, shortNames } =
      /** @type { PlaceService } */ (this.props.placeService);

    const { location } = getActiveTab(this.props.panelId);
    const place = getActive(location);
    const { filesystemFree, filesystemSize, name } = place;

    const status = "[" + name + "] " +
      formatSize(filesystemFree) + " of " +
      formatSize(filesystemSize) + " free";

    return (
      h(Box, { expand: false }, [
        h(Box, [
          h(ComboBox, {
            active: places.indexOf(place),
            ref: this.refComboBox,
          },
            h(ListStore, { cols: MountCols },
              places.map(x => h("stub", {
                icon: x,
                text: shortNames[x.name],
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
