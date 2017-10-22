const { PanelService } = require('../Panel/PanelService')
const { TabService } = require('../Tab/TabService')

exports.default = getActiveMountUri

/**
 * @param {{ panelService: PanelService, tabService: TabService }} services
 * @param {number} panelId
 */
function getActiveMountUri (services, panelId) {
  const { panelService, tabService } = services

  const tabId = panelService.entities[panelId].activeTabId
  const files = tabService.entities[tabId].files

  for (let i = 0; i < files.length; i++) {
    if (files[i].name === '.') {
      return files[i].mountUri
    }
  }

  return 'file:///'
}
