const { Box, Label } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { computed, decorate } = require("mobx");
const { File } = require("../../domain/File/File");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { PanelService } = require("../Panel/PanelService");
const formatSize = require("../Size/formatSize").default;
const { TabService } = require("../Tab/TabService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService?} [panelService]
 * @property {TabService?} [tabService]
 *
 * @extends Component<IProps>
 */
class Stats extends Component {
  get data() {
    const { panelId } = this.props;

    const { getActiveTabId } =
      /** @type {PanelService} */ (this.props.panelService);

    const { entities, visibleFiles } =
        /** @type {TabService} */ (this.props.tabService);

    const tabId = getActiveTabId(panelId);
    const tab = entities[tabId];

    const files = visibleFiles[tabId];
    const selected = tab.selected;

    return {
      selectedCount: selected.length,
      selectedSize: TotalSize(selected.map(index => files[index])),
      totalCount: files.length,
      totalSize: TotalSize(files),
    };
  }

  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);

    autoBind(this, Stats.prototype, __filename);
  }

  render() {
    const { selectedCount, selectedSize, totalCount, totalSize } = this.data;

    return (
      h(Box, { border_width: 4 }, [
        h(Label, {
          label: formatSize(selectedSize) + " / " + formatSize(totalSize) +
            " in " + selectedCount + " / " + totalCount + " file(s)",
        }),
      ])
    );
  }
}

decorate(Stats, {
  data: computed,
});

exports.Stats = Stats;
exports.default = inject("panelService", "tabService")(observer(Stats));

exports.TotalSize = TotalSize;
/**
 * @param {File[]} files
 */
function TotalSize(files) {
  return files.map(x => x.size).reduce((prev, x) => prev + x, 0);
}
