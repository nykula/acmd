const { Box, IconSize, Image, ReliefStyle, VSeparator } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { TabService } = require("../Tab/TabService");
const ToggleButton = require("../ToggleButton/ToggleButton").default;
const ToolbarJobs = require("./ToolbarJobs").default;

const items = [
  {
    icon: "view-refresh",
    id: "windowService.refresh",
    label: "Refresh",
  },

  {
    icon: "format-justify-left",
    id: "tabService.toggleGrid",
    label: "Grid",
  },

  "history",

  {
    icon: "go-previous",
    id: "panelService.back",
    label: "Back",
  },

  {
    icon: "go-next",
    id: "panelService.forward",
    label: "Forward",
  },

  "misc",

  {
    icon: "go-jump",
    id: "panelService.ls",
    label: "Go to URI",
  },

  {
    icon: "document-new",
    id: "directoryService.touch",
    label: "Create file",
  },

  {
    icon: "utilities-terminal",
    id: "directoryService.terminal",
    label: "Terminal",
  },

  {
    icon: "dialog-warning",
    id: "windowService.showHidSys",
    label: "Hidden files",
  },

  "jobs-",

  "jobs",
];

/**
 * @typedef {{ [key: string]: any }} IProps
 * @property {ActionService?} [actionService]
 * @property {TabService?} [tabService]
 *
 * @extends Component<IProps>
 */
class Toolbar extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, Toolbar.prototype, __filename);
  }

  render() {
    const { actionService, tabService } = this.props;

    return (
      h(Box, items.map(item => {
        if (item === "jobs-") {
          return h(Box, { hexpand: true, key: item });
        }

        if (item === "jobs") {
          return h(ToolbarJobs, { key: item });
        }

        if (typeof item === "string") {
          return h(VSeparator, { key: item });
        }

        if (item.id === "tabService.toggleGrid") {
          return (
            h(ToggleButton, {
              can_focus: false,
              key: item.id,
              pressedCallback: actionService.get(item.id).handler,
              relief: ReliefStyle.NONE,
              tooltip_text: tabService.isGrid ? "Table" : "Grid",
            }, [
                h(Image, {
                  icon_name:
                  (tabService.isGrid
                    ? "format-justify-left"
                    : "format-justify-fill") + "-symbolic",
                  icon_size: IconSize.SMALL_TOOLBAR,
                }),
              ])
          );
        }

        return (
          h(ToggleButton, {
            active: item.id === "windowService.showHidSys" && tabService.showHidSys,
            can_focus: false,
            key: item.icon,
            pressedCallback: item.id ? actionService.get(item.id).handler : null,
            relief: ReliefStyle.NONE,
            tooltip_text: item.label,
          }, [
              h(Image, {
                icon_name: item.icon + "-symbolic",
                icon_size: IconSize.SMALL_TOOLBAR,
              }),
            ])
        );
      }))
    );
  }
}

exports.Toolbar = Toolbar;
exports.default = connect(["actionService", "tabService"])(Toolbar);
