exports.default = getPanelIdByTabId
/**
 * @param {any} panels
 * @param {number} tabId
 */
function getPanelIdByTabId (panels, tabId) {
  return panels[0].tabIds.indexOf(tabId) > -1 ? 0 : 1
}
