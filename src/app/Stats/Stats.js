const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { File } = require("../../domain/File/File");
const getVisibleFiles = require("../Action/getVisibleFiles").default;
const autoBind = require("../Gjs/autoBind").default;
const { PanelService } = require("../Panel/PanelService");
const formatSize = require("../Size/formatSize").default;
const { ShowHidSysService } = require("../ShowHidSys/ShowHidSysService");
const { TabService } = require("../Tab/TabService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {ShowHidSysService} showHidSysService
 * @property {TabService} tabService
 *
 * @param {IProps} param0
 */
function Stats(props) {
  Component.call(this, props);
  autoBind(this, Stats.prototype);
}

Stats.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
Stats.prototype.props = undefined;

Stats.prototype.getData = function() {
  const tabId = this.props.panelService.entities[this.props.panelId].activeTabId;
  const tab = this.props.tabService.entities[tabId];

  const files = getVisibleFiles({
    files: tab.files,
    showHidSys: this.props.showHidSysService.state,
  });

  const selected = tab.selected;

  return {
    selectedCount: selected.length,
    selectedSize: totalSize(files.filter((_, i) => selected.indexOf(i) !== -1)),
    totalCount: files.length,
    totalSize: totalSize(files),
  };
};

Stats.prototype.render = function() {
  const { selectedCount, selectedSize, totalCount, totalSize } = this.getData();

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
exports.default = connect(["panelService", "showHidSysService", "tabService"])(Stats);

exports.totalSize = totalSize;
/**
 * @param {File[]} files
 */
function totalSize(files) {
  return files.map(x => x.size).reduce((prev, x) => prev + x, 0);
}
