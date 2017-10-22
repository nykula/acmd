const { PanelService } = require('./PanelService')

/**
 * @param {PanelService} panelService
 */
exports.default = function getActiveTabId (panelService) {
  return panelService.entities[panelService.activeId].activeTabId
}
