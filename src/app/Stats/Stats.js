const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { computed, extendObservable } = require("mobx");
const { File } = require("../../domain/File/File");
const { autoBind } = require("../Gjs/autoBind");
const { PanelService } = require("../Panel/PanelService");
const formatSize = require("../Size/formatSize").default;
const { TabService } = require("../Tab/TabService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function Stats(props) {
  Component.call(this, props);
  autoBind(this, Stats.prototype, __filename);

  extendObservable(this, {
    data: computed(this.getData),
  });
}

Stats.prototype = Object.create(Component.prototype);

/**
 * @type {{ selectedCount: number, selectedSize: number, totalCount: number, totalSize: number }}
 */
Stats.prototype.data = undefined;

/**
 * @type {IProps}
 */
Stats.prototype.props = undefined;

Stats.prototype.getData = function() {
  const { panelId, panelService, tabService } = this.props;
  const tabId = panelService.getActiveTabId(panelId);
  const tab = tabService.entities[tabId];

  const files = tabService.visibleFiles[tabId];
  const selected = tab.selected;

  return {
    selectedCount: selected.length,
    selectedSize: TotalSize(selected.map(index => files[index])),
    totalCount: files.length,
    totalSize: TotalSize(files),
  };
};

Stats.prototype.render = function() {
  const { selectedCount, selectedSize, totalCount, totalSize } = this.data;

  return (
    h("box", { border_width: 4 }, [
      h("label", {
        label: formatSize(selectedSize) + " / " + formatSize(totalSize) +
        " in " + selectedCount + " / " + totalCount + " file(s)",
      }),
    ])
  );
};

exports.Stats = Stats;
exports.default = connect(["panelService", "tabService"])(Stats);

exports.TotalSize = TotalSize;
/**
 * @param {File[]} files
 */
function TotalSize(files) {
  return files.map(x => x.size).reduce((prev, x) => prev + x, 0);
}
