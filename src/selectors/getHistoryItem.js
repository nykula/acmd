const getPanelIdByTabId = require('./getPanelIdByTabId').default

exports.default = getHistoryItem
function getHistoryItem (state, tabId, delta) {
  const panelId = getPanelIdByTabId(state.entities.panels, tabId)
  const { history, now } = state.entities.panels[panelId]
  const nextNow = now + delta

  if (nextNow < 0 || nextNow > history.length - 1) {
    return null
  }

  return history[nextNow]
}
