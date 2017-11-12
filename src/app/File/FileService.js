const { action, extendObservable } = require("mobx");
const { FileHandler } = require("../../domain/File/FileHandler");
const { autoBind } = require("../Gjs/autoBind");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");

/**
 * @param {PanelService} panelService
 * @param {TabService} tabService
 */
function FileService(panelService, tabService) {
  autoBind(this, FileService.prototype, __filename);

  this.panelService = panelService;
  this.tabService = tabService;

  extendObservable(this, {
    cursor: action(this.cursor),
    handlers: [],
    selected: action(this.selected),
    setHandlers: action(this.setHandlers),
  });
}

/**
 * @type {FileHandler[]}
 */
FileService.prototype.handlers = [];

/**
 * @param {{ panelId: number, tabId: number, cursor: number }} props
 */
FileService.prototype.cursor = function(props) {
  const { panelId, tabId, cursor } = props;

  this.panelService.setActiveId(panelId);

  this.tabService.cursor({
    cursor: cursor,
    tabId: tabId,
  });
};

/**
 * @param {{ panelId: number, tabId: number, selected: number[] }} props
 */
FileService.prototype.selected = function(props) {
  const { panelId, selected, tabId } = props;

  this.panelService.setActiveId(panelId);

  this.tabService.selected({
    selected: selected,
    tabId: tabId,
  });
};

/**
 * @param {FileHandler[]} handlers
 */
FileService.prototype.setHandlers = function(handlers) {
  this.handlers = handlers;
};

exports.FileService = FileService;
