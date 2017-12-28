const { Menu, MenuItem } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const Nullthrows = require("nullthrows").default;
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class PlaceMenu extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlaceMenu.prototype, __filename);
  }

  isActive() {
    const { getActivePlace } = Nullthrows(this.props.panelService);
    const { selected } = Nullthrows(this.props.placeService);

    const place = getActivePlace(this.props.panelId);
    return place === selected;
  }

  /**
   * @param {Menu | null} menu
   */
  ref(menu) {
    const placeService = Nullthrows(this.props.placeService);
    placeService.menus[this.props.panelId] = menu;
  }

  /**
   * @param {MenuItem | null} item
   */
  refMount(item) {
    if (!item) {
      return;
    }

    const { refresh } = Nullthrows(this.props.panelService);
    const { mountUuid } = Nullthrows(this.props.placeService);

    item.connect("activate", () => {
      const { selected } = Nullthrows(this.props.placeService);
      const { uuid } = Nullthrows(selected);

      mountUuid(Nullthrows(uuid), refresh);
    });
  }

  /**
   * @param {MenuItem | null} item
   */
  refOpen(item) {
    if (!item) {
      return;
    }

    const { openPlace } = Nullthrows(this.props.panelService);

    item.connect("activate", () => {
      const { selected } = Nullthrows(this.props.placeService);

      openPlace(this.props.panelId, Nullthrows(selected));
    });
  }

  /**
   * @param {MenuItem | null} item
   */
  refUnmount(item) {
    if (!item) {
      return;
    }

    const { refresh } = Nullthrows(this.props.panelService);
    const { unmount } = Nullthrows(this.props.placeService);

    item.connect("activate", () => {
      const { selected } = Nullthrows(this.props.placeService);
      const { rootUri } = Nullthrows(selected);

      unmount(Nullthrows(rootUri), refresh);
    });
  }

  render() {
    const { selected } = Nullthrows(this.props.placeService);

    return (
      h("stub-box", [
        h(Menu, { ref: this.ref }, [
          h(MenuItem, {
            key: "Open",
            label: "Open",
            ref: this.refOpen,
          }),

          (selected && !selected.rootUri && selected.uuid) ? (
            h(MenuItem, {
              key: "Mount",
              label: "Mount",
              ref: this.refMount,
            })
          ) : null,

          (selected && selected.canUnmount && !this.isActive()) ? (
            h(MenuItem, {
              key: "Unmount",
              label: "Unmount",
              ref: this.refUnmount,
            })
           ) : null,
        ]),
      ])
    );
  }
}

exports.PlaceMenu = PlaceMenu;
exports.default = connect(["panelService", "placeService"])(PlaceMenu);
