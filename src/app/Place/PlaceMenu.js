const { Menu, MenuItem } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const nullthrows = require("nullthrows").default;
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
    const { getActivePlace } = nullthrows(this.props.panelService);
    const { selected } = nullthrows(this.props.placeService);

    const place = getActivePlace(this.props.panelId);
    return place === selected;
  }

  /**
   * @param {Menu | null} menu
   */
  ref(menu) {
    const placeService = nullthrows(this.props.placeService);
    placeService.menus[this.props.panelId] = menu;
  }

  /**
   * @param {MenuItem | null} item
   */
  refMount(item) {
    if (!item) {
      return;
    }

    const { refresh } = nullthrows(this.props.panelService);
    const { mountUuid } = nullthrows(this.props.placeService);

    item.connect("activate", () => {
      const { selected } = nullthrows(this.props.placeService);
      const { uuid } = nullthrows(selected);

      mountUuid(nullthrows(uuid), refresh);
    });
  }

  /**
   * @param {MenuItem | null} item
   */
  refOpen(item) {
    if (!item) {
      return;
    }

    const { openPlace } = nullthrows(this.props.panelService);

    item.connect("activate", () => {
      const { selected } = nullthrows(this.props.placeService);

      openPlace(this.props.panelId, nullthrows(selected));
    });
  }

  /**
   * @param {MenuItem | null} item
   */
  refUnmount(item) {
    if (!item) {
      return;
    }

    const { refresh } = nullthrows(this.props.panelService);
    const { unmount } = nullthrows(this.props.placeService);

    item.connect("activate", () => {
      const { selected } = nullthrows(this.props.placeService);
      const { rootUri } = nullthrows(selected);

      unmount(nullthrows(rootUri), refresh);
    });
  }

  render() {
    const { selected } = nullthrows(this.props.placeService);

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
exports.default = inject("panelService", "placeService")(observer(PlaceMenu));
