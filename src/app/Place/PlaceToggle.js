const { Gravity } = imports.gi.Gdk;
const { Box, Button, IconSize, Image, Label } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const nullthrows = require("nullthrows").default;
const { Drag } = require("../Drag/Drag");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { MouseEvent } = require("../Mouse/MouseEvent");
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
class PlaceToggle extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlaceToggle.prototype, __filename);
  }

  show() {
    const { popovers } = nullthrows(this.props.placeService);
    const popover = nullthrows(popovers[this.props.panelId]);

    popover.show_all();
  }

  /**
   * @param {Button | null} button
   */
  ref(button) {
    if (!button) {
      return;
    }

    const { toggles } = nullthrows(this.props.placeService);
    toggles[this.props.panelId] = button;

    button.connect("clicked", this.show);

    new Drag(button).onEnter(this.show);

    MouseEvent.connectMenu(button, () => {
      const { getActivePlace } = nullthrows(this.props.panelService);
      const { menus, select } = nullthrows(this.props.placeService);
      const menu = nullthrows(menus[this.props.panelId]);

      select(getActivePlace(this.props.panelId));

      menu.popup_at_widget(
        button,
        Gravity.CENTER,
        Gravity.STATIC,
        null,
      );
    });
  }

  render() {
    const { getActivePlace } = nullthrows(this.props.panelService);
    const { shortNames } = nullthrows(this.props.placeService);
    const activePlace = getActivePlace(this.props.panelId);

    return (
      h(Button, {
        can_focus: false,
        ref: this.ref,
      }, [
          h(Box, { spacing: 4 }, [
            h(Image, {
              gicon: GioIcon.get(activePlace),
              icon_size: IconSize.SMALL_TOOLBAR,
            }),

            h(Label, { label: shortNames[activePlace.name] }),

            h(Image, {
              icon_name: "pan-down-symbolic",
              icon_size: IconSize.SMALL_TOOLBAR,
            }),
          ]),
        ])
    );
  }
}

exports.PlaceToggle = PlaceToggle;
exports.default = inject("panelService", "placeService")(observer(PlaceToggle));
