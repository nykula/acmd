const { Box, EventBox, Label, StateFlags } = imports.gi.Gtk;
const { EllipsizeMode } = imports.gi.Pango;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { action, autorun, extendObservable, observable } = require("mobx");
const Nullthrows = require("nullthrows").default;
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const { UriService } = require("../Uri/UriService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {UriService?} [uriService]
 *
 * @extends Component<IProps>
 */
class Location extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);

    /** @type {EventBox | null} */
    this.box = null;

    autoBind(this, Location.prototype, __filename);
    extendObservable(this, {
      box: observable.ref(this.box),
      ref: action(this.ref),
    });
    this.unsubscribeSelection = autorun(this.updateSelection);
  }

  componentWillUnmount() {
    this.unsubscribeSelection();
  }

  isActive() {
    const { activeId } = Nullthrows(this.props.panelService);

    return activeId === this.props.panelId;
  }

  /**
   * @param {EventBox | null} box
   */
  ref(box) {
    this.box = box;

    if (box) {
      box.connect("button-press-event", () => {
        const { setActive } = Nullthrows(this.props.panelService);
        setActive(this.props.panelId);
      });
    }
  }

  updateSelection() {
    if (!this.box) {
      return;
    }

    if (this.isActive()) {
      this.box.set_state_flags(StateFlags.SELECTED, false);
    } else {
      this.box.unset_state_flags(StateFlags.SELECTED);
    }
  }

  render() {
    const { getActiveTab } = Nullthrows(this.props.panelService);
    const { unescape } = Nullthrows(this.props.uriService);

    const { location } = getActiveTab(this.props.panelId);
    const label = unescape(location).replace(/\/?$/, "/*");

    return h(EventBox, { ref: this.ref }, [
      h(Box, { border_width: 3 }, [
        h(Box, { border_width: 2 }),
        h(Label, {
          ellipsize: EllipsizeMode.MIDDLE,
          label: label,
        }),
      ]),
    ]);
  }
}

exports.Location = Location;
exports.default = connect(["panelService", "uriService"])(Location);
