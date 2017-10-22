const getPanelIdByTabId = require('./getPanelIdByTabId').default

exports.default = getHistoryItem
/**
 * @param {*} state
 * @param {number} tabId
 * @param {number} delta
 */
function getHistoryItem (state, tabId, delta) {
  const panelId = getPanelIdByTabId(state.panels, tabId)
  const { history, now } = state.panels[panelId]
  const nextNow = now + delta

  if (nextNow < 0 || nextNow > history.length - 1) {
    return null
  }

  return history[nextNow]
}
