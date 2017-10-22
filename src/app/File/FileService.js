const { LogService } = require('../Log/LogService')
const { PanelService } = require('../Panel/PanelService')
const { TabService } = require('../Tab/TabService')

/**
 * @param {LogService} logService
 * @param {PanelService} panelService
 * @param {TabService} tabService
 */
function FileService (logService, panelService, tabService) {
  this.logService = logService
  this.panelService = panelService
  this.tabService = tabService
}

/**
 * @param {{ panelId: number, tabId: number, cursor: number }} props
 */
FileService.prototype.cursor = function (props) {
  const { panelId, tabId, cursor } = props

  this.panelService.setActiveId(panelId)

  this.tabService.cursor({
    cursor: cursor,
    tabId: tabId
  })
}

/**
 * @param {{ panelId: number, tabId: number, selected: number[] }} props
 */
FileService.prototype.selected = function (props) {
  const { panelId, selected, tabId } = props

  this.panelService.setActiveId(panelId)

  this.tabService.selected({
    selected: selected,
    tabId: tabId
  })
}

exports.FileService = FileService
