const Gtk = imports.gi.Gtk;
const { Window } = Gtk;
const { autoBind } = require("../Gjs/autoBind");
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");
const { TabService } = require("../Tab/TabService");

class WindowService {
  /**
   * @typedef IProps
   * @property {PanelService} panelService
   * @property {PlaceService} placeService
   * @property {TabService} tabService
   * @property {Window} window
   *
   * @param {IProps} props
   */
  constructor(props) {
    this.Gtk = Gtk;
    this.props = props;

    autoBind(this, WindowService.prototype, __filename);
  }

  exit() {
    const { window } = this.props;
    window.destroy();
  }

  issue() {
    const time = Math.floor(Date.now() / 1000);
    this.Gtk.show_uri(
      null,
      "https://github.com/makepost/acme-commander/issues",
      time,
    );
  }

  refresh() {
    const { panelService, placeService } = this.props;
    panelService.refresh();
    placeService.refresh();
  }

  showHidSys() {
    const { tabService } = this.props;
    tabService.showHidSys = !tabService.showHidSys;
  }
}

exports.WindowService = WindowService;
