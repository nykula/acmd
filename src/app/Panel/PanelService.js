const { action, computed, extendObservable } = require("mobx");
const { File } = require("../../domain/File/File");
const { Panel } = require("../../domain/Panel/Panel");
const { autoBind } = require("../Gjs/autoBind");
const { TabService } = require("../Tab/TabService");

/**
 * @param {TabService} tabService
 */
function PanelService(tabService) {
  this.tabService = tabService;

  autoBind(this, PanelService.prototype, __filename);

  extendObservable(this, {
    activeId: this.activeId,
    entities: this.entities,
    nextTab: action(this.nextTab),
    prevTab: action(this.prevTab),
    pushLocation: action(this.pushLocation),
    removeTab: action(this.removeTab),
    replaceLocation: action(this.replaceLocation),
    setActiveId: action(this.setActiveId),
    setActiveTabId: action(this.setActiveTabId),
    toggleActive: action(this.toggleActive),
  });
}

PanelService.prototype.activeId = 0;

/**
 * @type {{ [id: string]: Panel }}
 */
PanelService.prototype.entities = {
  "0": {
    activeTabId: 0,
    history: ["file:///"],
    now: 0,
    tabIds: [0],
  },
  "1": {
    activeTabId: 1,
    history: ["file:///"],
    now: 0,
    tabIds: [1],
  },
};

/**
 * @param {number} id
 */
PanelService.prototype.setActiveId = function(id) {
  this.activeId = id;
};

PanelService.prototype.toggleActive = function() {
  this.activeId = this.activeId === 0 ? 1 : 0;
};

PanelService.prototype.getActiveTabId = function() {
  return this.entities[this.activeId].activeTabId;
};

/**
 * @param {{ id: number, tabId: number }} props
 */
PanelService.prototype.setActiveTabId = function(props) {
  const { id, tabId } = props;
  this.entities[id].activeTabId = tabId;
};

/**
 * @param {number} tabId
 */
PanelService.prototype.getIdByTabId = function(tabId) {
  return this.entities[0].tabIds.indexOf(tabId) > -1 ? 0 : 1;
};

PanelService.prototype.getNextTabId = function() {
  const ids = this.entities[0].tabIds.concat(this.entities[1].tabIds);
  return Math.max.apply(null, ids) + 1;
};

/**
 * @param {number} panelId
 */
PanelService.prototype.nextTab = function(panelId) {
  const tabIds = this.entities[panelId].tabIds;
  let index = tabIds.indexOf(this.entities[panelId].activeTabId) + 1;

  if (index >= tabIds.length) {
    index = 0;
  }

  this.setActiveTabId({
    id: panelId,
    tabId: tabIds[index],
  });
};

/**
 * @param {number} panelId
 */
PanelService.prototype.prevTab = function(panelId) {
  const tabIds = this.entities[panelId].tabIds;
  let index = tabIds.indexOf(this.entities[panelId].activeTabId) - 1;

  if (index < 0) {
    index = tabIds.length - 1;
  }

  this.setActiveTabId({
    id: panelId,
    tabId: tabIds[index],
  });
};

/**
 * @param { number } id
 */
PanelService.prototype.removeTab = function(id) {
  const panelId = this.getIdByTabId(id);
  const panel = this.entities[panelId];

  let index = panel.tabIds.indexOf(id);
  const isActive = panel.activeTabId === id;
  const isOnly = panel.tabIds.length === 1;
  const tabIds = isOnly ? panel.tabIds : panel.tabIds.filter(x => x !== id);
  index = Math.min(index, tabIds.length - 1);

  const activeTabId = isActive ? tabIds[index] : panel.activeTabId;
  this.setActiveTabId({
    id: panelId,
    tabId: activeTabId,
  });
  panel.tabIds = tabIds;
};

/**
 * @param {{ tabId: number, uri: string }} props
 */
PanelService.prototype.pushLocation = function(props) {
  const { tabId, uri } = props;
  const panelId = this.getIdByTabId(tabId);
  const panel = this.entities[panelId];

  panel.history = panel.history.slice(0, panel.now + 1).concat(uri);
  panel.now = panel.now + 1;
};

/**
 * @param {{ delta: number, tabId: number }} props
 */
PanelService.prototype.replaceLocation = function(props) {
  const { delta, tabId } = props;
  const panelId = this.getIdByTabId(tabId);
  const panel = this.entities[panelId];

  panel.now = panel.now + delta;
};

/**
 * @param {number} tabId
 * @param {number} delta
 */
PanelService.prototype.getHistoryItem = function(tabId, delta) {
  const panelId = this.getIdByTabId(tabId);
  const { history, now } = this.entities[panelId];
  const nextNow = now + delta;

  if (nextNow < 0 || nextNow > history.length - 1) {
    return null;
  }

  return history[nextNow];
};

exports.PanelService = PanelService;
