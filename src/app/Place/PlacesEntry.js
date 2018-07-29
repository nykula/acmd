const { DragAction, Gravity } = imports.gi.Gdk;
const { Box, Button, IconSize, Image, Label, ReliefStyle } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const nullthrows = require("nullthrows").default;
const { Place } = require("../../domain/Place/Place");
const { GioIcon } = require("../Gio/GioIcon");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {JobService?} [jobService]
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {Place} place
 * @property {PlaceService?} [placeService]
 *
 * @extends Component<IProps>
 */
class PlacesEntry extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, PlacesEntry.prototype, __filename);
  }

  /**
   * @param {{ action: number, uris: string[] }} ev
   */
  handleDrop(ev) {
    const { run } = nullthrows(this.props.jobService);
    const { refresh } = nullthrows(this.props.panelService);

    run({
      destUri: nullthrows(this.props.place.rootUri),
      type: ev.action === DragAction.MOVE ? "mv" : "cp",
      uris: ev.uris,
    }, refresh);
  }

  /**
   * @param {Button} button
   */
  handleMenu(button) {
    const { menus, select } = nullthrows(this.props.placeService);
    const menu = nullthrows(menus[this.props.panelId]);

    select(this.props.place);

    menu.popup_at_widget(
      button,
      Gravity.CENTER,
      Gravity.STATIC,
      null,
    );
  }

  handlePressed() {
    const { openPlace } = nullthrows(this.props.panelService);
    openPlace(this.props.panelId, this.props.place);
  }

  isActive() {
    const { getActivePlace } = nullthrows(this.props.panelService);
    const place = getActivePlace(this.props.panelId);

    return place === this.props.place;
  }

  render() {
    const { shortNames, status } = nullthrows(this.props.placeService);
    const { icon, iconType, name } = this.props.place;

    return h(ToggleButton, {
      active: this.isActive(),
      can_focus: false,
      dropCallback: this.handleDrop,
      menuCallback: this.handleMenu,
      pressedCallback: this.handlePressed,
      relief: ReliefStyle.NONE,
      tooltip_text: status(this.props.place),
    }, [
        h(Box, { spacing: 4 }, [
          h(Image, {
            gicon: GioIcon.get({ icon: icon, iconType: iconType }),
            icon_size: IconSize.SMALL_TOOLBAR,
          }),
          h(Label, { label: shortNames[name] }),
        ]),
      ]);
  }
}

exports.PlacesEntry = PlacesEntry;
exports.default = inject("jobService", "panelService", "placeService")(observer(PlacesEntry));
